import { BrowserProvider, ViewportConfig } from "@silyze/browser-provider";
import { Logger } from "@silyze/logger";

export type InputNode =
  | { type: "outputOf"; nodeName: string; outputName: string }
  | { type: "constant"; value: unknown };

export type Dependency = string | { nodeName: string; outputName: string };

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

type PipelineNodeOutput = Record<string, unknown>;
type PipelineThreadOutputs = Record<string, Record<string, PipelineNodeOutput>>;

type PipelineThreadState =
  | {
      status: "pending";
      promise: Promise<PipelineThreadOutputs>;
    }
  | {
      status: "error";
      error: unknown;
    }
  | {
      status: "complete";
      outputs: PipelineThreadOutputs;
    };

type PipelineThread = {
  root: PipelineTreeNode;
  state: PipelineThreadState;
  gc: EvaluationGC;
};

export async function waitForPipelineThread(thread: PipelineThread) {
  if (thread.state.status === "pending") {
    await thread.state.promise;
  }
  if (thread.state.status === "error") {
    throw thread.state.status;
  }
}

export class PipelineEvaluation {
  #logger: Logger;
  #library: EvaluationLibrary;
  #entrypoints: PipelineTreeNode[];
  #evaluated: Map<string, PipelineThreadOutputs> = new Map();

  constructor(entrypoints: PipelineTreeNode[], config: EvaluationConfig) {
    this.#logger = config.logger.createScope("eval");
    this.#library = config.libraryProvider(config);
    this.#entrypoints = entrypoints;

    console.dir(this.#entrypoints, { depth: null });

    this.#logger.log(
      "debug",
      "constructor",
      `Initialized with ${entrypoints.length} entrypoints`
    );
  }

  #createThreadWithGC(
    node: PipelineTreeNode,
    signal: AbortSignal | undefined,
    gc: EvaluationGC,
    markChanged: () => void
  ): PipelineThread {
    const promise = this.#evaluateNode(node, gc, signal);
    const thread: PipelineThread = {
      root: node,
      gc,
      state: {
        status: "pending",
        promise: promise
          .then((outputs) => {
            this.#logger.log(
              "debug",
              "thread",
              `Evaluation complete: ${node.name}`
            );
            thread.state = { status: "complete", outputs };
            markChanged();
            return outputs;
          })
          .catch((error) => {
            this.#logger.log(
              "warn",
              "thread",
              `Evaluation error: ${node.name}`,
              error
            );
            thread.state = { status: "error", error };
            throw error;
          }),
      },
    };
    return thread;
  }

  async *#evaluateRecursive(
    name: string,
    visited: Set<string>,
    signal: AbortSignal | undefined,
    gc: EvaluationGC,
    markChanged: () => void
  ): AsyncGenerator<PipelineThread> {
    if (visited.has(name)) return;
    visited.add(name);

    const node = this.#findNodeByName(name);
    if (!node) return;

    for (const dep of node.dependsOn) {
      const depName = typeof dep === "string" ? dep : dep.nodeName;
      yield* this.#evaluateRecursive(depName, visited, signal, gc, markChanged);
    }

    const thread = this.#createThreadWithGC(node, signal, gc, markChanged);
    yield thread;
  }

  async *evaluate(signal?: AbortSignal): AsyncGenerator<PipelineThread> {
    let changed = true;
    let cycle = 0;

    while (changed && cycle < 100) {
      changed = false;
      cycle++;
      const scope = this.#logger.createScope("evaluate");
      scope.log("debug", "", `Evaluation cycle ${cycle}`);

      const visited = new Set<string>();

      for (const entry of this.#entrypoints) {
        const entryScope = scope.createScope(`entry:${entry.name}`);
        entryScope.log("debug", "", `Evaluating entrypoint: ${entry.name}`);

        const gc = createEvaluationGC(this.#logger);
        const threads: PipelineThread[] = [];

        for await (const thread of this.#evaluateRecursive(
          entry.name,
          visited,
          signal,
          gc,
          () => {
            changed = true;
          }
        )) {
          threads.push(thread);
          yield thread;
        }

        await Promise.allSettled(
          threads.map((t) =>
            t.state.status === "pending" ? t.state.promise : undefined
          )
        );

        entryScope.log(
          "debug",
          "",
          `Collecting GC for entrypoint: ${entry.name}`
        );
        await gc[EvaluationGCCollect]();
      }

      if (!changed) {
        scope.log("debug", "", "No changes detected, exiting");
      }
    }
  }

  #createThread(
    node: PipelineTreeNode,
    signal?: AbortSignal
  ): PipelineThread & { state: { status: "pending" } } {
    const gc = createEvaluationGC(this.#logger);
    const promise = this.#evaluateNode(node, gc, signal);
    const thread: PipelineThread = {
      root: node,
      gc,
      state: {
        status: "pending",
        promise: promise
          .then((outputs) => {
            this.#logger.log(
              "debug",
              "thread",
              `Evaluation complete: ${node.name}`
            );
            thread.state = { status: "complete", outputs };
            return outputs;
          })
          .catch((error) => {
            this.#logger.log(
              "warn",
              "thread",
              `Evaluation error: ${node.name}`,
              error
            );
            thread.state = { status: "error", error };
            throw error;
          }),
      },
    };
    return thread as PipelineThread & { state: { status: "pending" } };
  }

  async #evaluateNode(
    node: PipelineTreeNode,
    gc: EvaluationGC,
    signal?: AbortSignal,
    path: Set<string> = new Set()
  ): Promise<PipelineThreadOutputs> {
    const scope = this.#logger.createScope(`eval:${node.name}`);
    scope.log("debug", "(start)", `Evaluating node: ${node.name}`);

    if (path.has(node.name)) {
      scope.log("warn", "cycle", `Cycle detected, re-evaluating ${node.name}`);
    } else if (this.#evaluated.has(node.name)) {
      scope.log("debug", "cache", `Using cached result for ${node.name}`);
      return this.#evaluated.get(node.name)!;
    }

    path.add(node.name);
    const dependencyOutputs: Record<string, PipelineNodeOutput> = {};

    for (const dep of node.dependsOn) {
      const depName = typeof dep === "string" ? dep : dep.nodeName;
      scope.log("debug", "dependency", `Resolving dependency: ${depName}`);

      const depNode = this.#findNodeByName(depName);
      if (!depNode) throw new Error(`Missing dependency node: ${depName}`);

      const result = await this.#evaluateNode(
        depNode,
        gc,
        signal,
        new Set(path)
      );
      Object.assign(dependencyOutputs, result[depName]);
    }

    scope.log("debug", "input", "Resolving inputs");
    const inputs = await this.#resolveInputs(node, dependencyOutputs);
    scope.log("debug", "inputs", "Resolved inputs", inputs);

    const fn = this.#library[node.node];
    if (!fn) throw new Error(`Missing node implementation: ${node.node}`);

    scope.log("debug", "execute", `Invoking implementation for ${node.node}`);
    const result = await fn(inputs, { logger: scope, gc });

    const output: PipelineThreadOutputs = {
      [node.name]: {
        [node.node]: result,
      },
    };

    for (const [outKey, outVal] of Object.entries(node.outputs)) {
      const value = result[outKey];
      if (!value) continue;

      if (typeof outVal === "object" && outVal !== null) {
        const targetNode = this.#findNodeByName(outVal.nodeName);
        if (!targetNode) continue;

        const targetInput = targetNode.inputs[outVal.inputName];
        if (
          !targetInput ||
          targetInput.type !== "constant" ||
          targetInput.value !== value
        ) {
          targetNode.inputs[outVal.inputName] = { type: "constant", value };
          this.#logger.log(
            "debug",
            "eval",
            `Updated input: ${outVal.nodeName}.${outVal.inputName} = ${value}`
          );

          this.#evaluated.delete(outVal.nodeName);
        }
      }
    }
    if (!path.has(node.name)) {
      this.#evaluated.set(node.name, output);
      scope.log("debug", "cache", `Stored result in cache for ${node.name}`);
    }

    path.delete(node.name);
    scope.log("debug", "(done)", `Finished node: ${node.name}`);

    return output;
  }

  async #resolveInputs(
    node: PipelineTreeNode,
    dependencyOutputs: Record<string, PipelineNodeOutput>
  ): Promise<Record<string, unknown>> {
    const resolved: Record<string, unknown> = {};
    const scope = this.#logger.createScope(`inputs:${node.name}`);

    for (const [key, input] of Object.entries(node.inputs)) {
      if (input.type === "constant") {
        resolved[key] = input.value;
        scope.log("debug", "constant", `${key} =`, input.value);
      } else if (input.type === "outputOf") {
        const output = dependencyOutputs[input.nodeName];
        if (!output) {
          throw new Error(`Missing output from dependency: ${input.nodeName}`);
        }
        resolved[key] = output[input.outputName];
        scope.log(
          "debug",
          "outputOf",
          `${key} <- ${input.nodeName}.${input.outputName} =`,
          output[input.outputName]
        );
      } else {
        scope.log("warn", "input", `Unknown input type for ${key}`, input);
        throw new Error(`Unknown input type: ${(input as any).type}`);
      }
    }

    return resolved;
  }

  #findNodeByName(name: string): PipelineTreeNode | undefined {
    const scope = this.#logger.createScope("findNode");
    scope.log("debug", "search", `Looking for node: ${name}`);
    const stack = [...this.#entrypoints];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current.name === name) return current;
      stack.push(...current.children);
    }
    scope.log("warn", "missing", `Node not found: ${name}`);
    return undefined;
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
