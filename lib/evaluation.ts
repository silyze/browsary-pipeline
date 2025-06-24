import { assert } from "@mojsoski/assert";
import { BrowserProvider, ViewportConfig } from "@silyze/browser-provider";
import { Logger } from "@silyze/logger";

export type InputNode =
  | { type: "outputOf"; nodeName: string; outputName: string }
  | { type: "constant"; value: unknown };

export type Dependency = string | { nodeName: string; outputName: string };

// TODO: rename inputName to outputName and fix the type-checking in the compiler
export type Output = string | { nodeName: string; inputName: string };

export type GenericNode = {
  node: `${string}::${string}`;
  inputs: Record<string, InputNode>;
  outputs: Record<string, Output>;
  dependsOn: Dependency | Dependency[];
};

const EvaluationGCCollect = Symbol("EvaluationGCCollect");

export interface EvaluationGC {
  registerFinalizer(finalizer: () => Promise<void> | void): void;
  [EvaluationGCCollect](): Promise<void>;
}

export type EvaluationNodeContext = {
  logger: Logger;
  gc: EvaluationGC;
  runtime: EvaluationRuntime;
  signal?: AbortSignal;
};

export type EvaluationNode = (
  input: Record<string, unknown>,
  context: EvaluationNodeContext
) => Promise<Record<string, unknown>>;

export type EvaluationLibrary = Record<`${string}::${string}`, EvaluationNode>;
export type EvaluationLibraryProvider = (
  config: EvaluationConfig
) => EvaluationLibrary;

export type EvaluationConfig = {
  logger: Logger;
  browserProvider: BrowserProvider;
  libraryProvider: EvaluationLibraryProvider;
  viewport?: ViewportConfig;
};

export type PipelineTreeNode = {
  name: string;
  dependsOn: Dependency[];
  node: `${string}::${string}`;
  inputs: Record<string, InputNode>;
  outputs: Record<string, Output>;
  children: PipelineTreeNode[];
};

export class Pipeline {
  #pipeline: Record<string, GenericNode>;
  #entrypoints: PipelineTreeNode[];

  toJSON(): Record<string, GenericNode> {
    return this.#pipeline;
  }

  createEvaluation(config: EvaluationConfig) {
    return new PipelineEvaluation(this.#entrypoints, config);
  }

  public constructor(
    pipeline: Record<string, GenericNode>,
    entrypoints: PipelineTreeNode[]
  ) {
    this.#pipeline = pipeline;
    this.#entrypoints = entrypoints;
  }
}

type PipelineThreadState =
  | {
      status: "pending";
      promise: Promise<void>;
    }
  | {
      status: "error";
      error: unknown;
    }
  | {
      status: "complete";
    };

export type EvaluationRuntime = {
  functions: Record<string, (doNotRunChildren?: boolean) => Promise<void>>;
  outputs: Record<string, Record<string, any>>;
  assert: (value: unknown, message?: string) => asserts value;
  invoke: (name: string, doNotRunChildren?: boolean) => Promise<void>;
  state: Record<string, "complete" | "pending" | "error">;
  library: Record<
    string,
    (inputs: Record<string, unknown>) => Promise<Record<string, unknown>>
  >;
};

type PipelineThread = {
  state: PipelineThreadState;
  runtime: EvaluationRuntime;
};

export async function waitForPipelineThread(thread: PipelineThread) {
  if (thread.state.status === "pending") {
    await thread.state.promise;
    return;
  }
  if (thread.state.status === "error") {
    throw thread.state.status;
  }

  if (thread.state.status === "complete") {
    return;
  }

  assert(false, "Unreachable code reached");
}

// TODO: use yield and yield * instead of await to have controlled execution
// TODO: move this into a class and add logging where appropriate
// TODO: also add a bytecode step, and emit all functions outside of each other
function jitTree(entrypoint: PipelineTreeNode) {
  const chunks: string[] = [];
  const emit = (node: PipelineTreeNode, seen = new Set<PipelineTreeNode>()) => {
    seen.add(node);
    chunks.push(
      "this.functions[",
      JSON.stringify(node.name),
      "]=async function(c){"
    );
    for (const dependency of node.dependsOn) {
      if (typeof dependency !== "string") {
        chunks.push(
          "await this.invoke(",
          JSON.stringify(dependency.nodeName),
          ", true);"
        );
        chunks.push(
          "if(this.outputs[",
          JSON.stringify(dependency.nodeName),
          "][",
          JSON.stringify(dependency.outputName),
          "]!==true)return;"
        );
      }
    }

    chunks.push("const inputs={};");
    for (const [inputName, inputValue] of Object.entries(node.inputs)) {
      chunks.push("inputs[", JSON.stringify(inputName), "]=");
      if (inputValue.type === "constant") {
        chunks.push(JSON.stringify(inputValue.value), ";");
      } else {
        chunks.push(
          "this.outputs[",
          JSON.stringify(inputValue.nodeName),
          "][",
          JSON.stringify(inputValue.outputName),
          "];"
        );
      }
    }

    chunks.push(
      "const libraryOutput=await this.library[",
      JSON.stringify(node.node),
      "](inputs);"
    );

    chunks.push("this.outputs[", JSON.stringify(node.name), "]={};");
    for (const [key, value] of Object.entries(node.outputs)) {
      if (typeof value === "string") {
        chunks.push(
          "this.outputs[",
          JSON.stringify(node.name),
          "][",
          JSON.stringify(value),
          "]="
        );
      } else {
        chunks.push(
          "this.outputs[",
          JSON.stringify(value.nodeName),
          "][",
          JSON.stringify(value.inputName),
          "]="
        );
      }
      chunks.push("libraryOutput[", JSON.stringify(key), "];");
    }

    chunks.push("this.state[", JSON.stringify(node.name), ']="complete";');

    chunks.push("const children=[];");

    for (const child of node.children) {
      if (!seen.has(child)) {
        emit(child, new Set(seen));
      }
      chunks.push(
        "if(!c)children.push(this.invoke(",
        JSON.stringify(child.name),
        "));"
      );
    }

    chunks.push("await Promise.all(children);");

    chunks.push("};");
  };

  emit(entrypoint);

  const code = Function(chunks.join(""));

  return (runtime: EvaluationRuntime) => code.apply(runtime);
}

// TODO: add logging where appropriate
export class PipelineEvaluation {
  #logger: Logger;
  #library: EvaluationLibrary;
  #entrypoints: PipelineTreeNode[];

  constructor(entrypoints: PipelineTreeNode[], config: EvaluationConfig) {
    this.#logger = config.logger.createScope("eval");
    this.#library = config.libraryProvider(config);
    this.#entrypoints = entrypoints;

    this.#logger.log(
      "debug",
      "constructor",
      `Initialized with ${entrypoints.length} entrypoints`
    );
  }

  async #createThread(
    entrypoint: PipelineTreeNode,
    signal?: AbortSignal
  ): Promise<PipelineThread> {
    const gc = createEvaluationGC(this.#logger);
    const runtime = this.#createRuntime(gc, signal);

    jitTree(entrypoint)(runtime);

    return {
      runtime,
      state: {
        status: "pending",
        promise: runtime
          .invoke(entrypoint.name)
          .finally(() => gc[EvaluationGCCollect]()),
      },
    };
  }

  #createRuntime(gc: EvaluationGC, signal?: AbortSignal): EvaluationRuntime {
    const runtime: EvaluationRuntime = {
      functions: {},
      state: {},
      assert(value, message) {
        assert(value, message);
      },
      outputs: {},
      async invoke(name: string, ...rest) {
        this.state[name] = "pending";
        try {
          await this.functions[name].apply(this, rest);
        } catch (e) {
          this.state[name] = "error";
          throw e;
        }
      },
      library: Object.fromEntries(
        Object.entries(this.#library).map(([name, fn]) => [
          name,
          (input) =>
            fn(input, {
              gc,
              logger: this.#logger.createScope(name),
              signal,
              runtime,
            }),
        ])
      ),
    };

    return runtime;
  }

  async *evaluate(signal?: AbortSignal): AsyncGenerator<PipelineThread> {
    for (const entrypoint of this.#entrypoints) {
      if (signal) {
        signal.throwIfAborted();
      }
      yield await this.#createThread(entrypoint, signal);
    }
  }
}

function createEvaluationGC(logger: Logger): EvaluationGC {
  const scope = logger.createScope("gc");
  let finalizers: (() => Promise<void> | void)[] = [];

  return {
    registerFinalizer(finalizer: () => Promise<void> | void) {
      const index = finalizers.length;
      finalizers.push(finalizer);
      scope.log("debug", "registerFinalizer", `Added finalizer #${index}`);
    },

    async [EvaluationGCCollect]() {
      const collectScope = scope.createScope("#collect");
      const oldFinalizers = finalizers;
      finalizers = [];
      collectScope.log(
        "debug",
        "(start)",
        `Collecting ${oldFinalizers.length} finalizers`
      );

      for (let i = oldFinalizers.length - 1; i >= 0; i--) {
        const finalizerScope = collectScope.createScope(`finalizer:${i}`);
        finalizerScope.log("debug", "running", `Running finalizer #${i}`);
        try {
          await oldFinalizers[i]();
          finalizerScope.log("debug", "complete", "Finalizer completed");
        } catch (err) {
          finalizerScope.log("warn", "failed", "Finalizer failed", err);
        }
      }

      collectScope.log("debug", "(done)", "All finalizers processed");
    },
  };
}
