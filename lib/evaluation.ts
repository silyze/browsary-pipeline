import { assert } from "@mojsoski/assert";
import { BrowserProvider, ViewportConfig } from "@silyze/browser-provider";
import { Logger, createErrorObject } from "@silyze/logger";
import { PipelineTreeJIT } from "./jit";
import { EvaluationPackage } from "./library";

export type InputNode =
  | { type: "outputOf"; nodeName: string; outputName: string }
  | { type: "constant"; value: unknown };

export type Dependency = string | { nodeName: string; outputName: string };

export type Output = string | { nodeName: string; outputName: string };

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

export type EvaluationLibrary = Record<
  `${string}::${string}`,
  EvaluationNode & { package: EvaluationPackage<string> }
>;
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
  functions: Record<
    string,
    (doNotRunChildren?: boolean) => AsyncGenerator<void, void, unknown>
  >;
  outputs: Record<string, Record<string, any>>;
  assert: (value: unknown, message?: string) => asserts value;
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

    const jit = new PipelineTreeJIT(entrypoint, this.#library);
    const unit = jit.compile();
    unit.injectInto(runtime);

    const gen = runtime.functions[entrypoint.name].call(runtime);

    const threadLogger = this.#logger.createScope(`thread:${entrypoint.name}`);

    const thread: PipelineThread = {
      runtime,
      state: {
        status: "pending",
        promise: Promise.resolve(),
      },
    };

    assert(thread.state.status === "pending", "Impossible state");

    threadLogger.log("debug", "start", "Starting pipeline thread execution");

    thread.state.promise = (async () => {
      try {
        let step = 0;
        for await (const _ of gen) {
          if (signal) signal.throwIfAborted();
          threadLogger.log("debug", `yield:${step}`, "Step yielded");
          step++;
        }
        thread.state = { status: "complete" };
        threadLogger.log(
          "debug",
          "done",
          `Execution complete after ${step} steps`
        );
      } catch (error) {
        thread.state = { status: "error", error };
        threadLogger.log(
          "error",
          "exception",
          "Execution failed",
          createErrorObject(error)
        );
        throw error;
      } finally {
        threadLogger.log("debug", "gc", "Running finalizers");
        await gc[EvaluationGCCollect]();
        threadLogger.log("debug", "gc", "Finalizers completed");
      }
    })();

    return thread;
  }

  #createRuntime(gc: EvaluationGC, signal?: AbortSignal): EvaluationRuntime {
    const runtime: EvaluationRuntime = {
      functions: {},
      state: {},
      assert(value, message) {
        assert(value, message);
      },
      outputs: {},
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
