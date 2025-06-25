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

export interface BaseNodeEvent {
  node: string;
  event: string;
}

export type NodeStartEvent = {
  event: "start";
} & BaseNodeEvent;

export type NodeCompleteEvent = {
  event: "end";
} & BaseNodeEvent;

export type NodeErrorEvent = {
  event: "error";
  error: unknown;
} & BaseNodeEvent;

export type NodeChildStartEvent = {
  event: "child-start";
  child: string;
} & BaseNodeEvent;

export type NodeChildEndEvent = {
  event: "child-end";
  child: string;
} & BaseNodeEvent;

export type PipelineNodeEvent =
  | NodeStartEvent
  | NodeCompleteEvent
  | NodeErrorEvent
  | NodeChildStartEvent
  | NodeChildEndEvent;

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
    (doNotRunChildren?: boolean) => AsyncGenerator<PipelineNodeEvent>
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

async function runPipelineGenerator(
  logger: Logger,
  generator: AsyncGenerator<PipelineNodeEvent>,
  gc: EvaluationGC,
  signal?: AbortSignal
): Promise<void> {
  const scope = logger.createScope("runner");
  let step = 0;

  try {
    for await (const event of generator) {
      if (signal) signal.throwIfAborted();
      if (event.event === "error") {
        scope.log("error", `yield:${step}`, "Step yielded", {
          ...event,
          error: createErrorObject(event.error),
        });
      } else {
        scope.log("debug", `yield:${step}`, "Step yielded", event);
      }
      step++;
    }

    scope.log("debug", "done", `Execution complete after ${step} steps`);
  } catch (error) {
    scope.log(
      "error",
      "exception",
      "Execution failed",
      createErrorObject(error)
    );
    throw error;
  } finally {
    scope.log("debug", "gc", "Running finalizers");
    await gc[EvaluationGCCollect]();
    scope.log("debug", "gc", "Finalizers completed");
  }
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
    const threadLogger = this.#logger.createScope(`thread:${entrypoint.name}`);
    threadLogger.log("debug", "init", "Creating evaluation thread");

    const gc = createEvaluationGC(this.#logger);
    const runtime = this.#createRuntime(gc, signal);

    const jit = new PipelineTreeJIT(entrypoint, this.#library);
    threadLogger.log("debug", "jit", "Compiling JIT unit");

    const unit = jit.compile();

    threadLogger.log("debug", "jit", "JIT unit compiled successfully", {
      entrypoint: entrypoint.name,
      sourceLength: unit.source.length,
      source: unit.source,
    });

    unit.injectInto(runtime);
    threadLogger.log("debug", "jit", "Injected compiled unit into runtime");

    const gen = runtime.functions[entrypoint.name].call(runtime);
    threadLogger.log("debug", "generator", "Pipeline generator created");

    const thread: PipelineThread = {
      runtime,
      state: {
        status: "pending",
        promise: Promise.resolve(),
      },
    };

    threadLogger.log("debug", "start", "Starting pipeline thread execution");

    assert(thread.state.status === "pending");
    thread.state.promise = (async () => {
      try {
        await runPipelineGenerator(threadLogger, gen, gc, signal);
        thread.state = { status: "complete" };
        threadLogger.log("debug", "status", "Thread marked complete");
      } catch (error) {
        thread.state = { status: "error", error };
        threadLogger.log(
          "error",
          "status",
          "Thread marked error",
          createErrorObject(error)
        );
        throw error;
      }
    })();

    return thread;
  }

  #createRuntime(gc: EvaluationGC, signal?: AbortSignal): EvaluationRuntime {
    const runtimeLogger = this.#logger.createScope("runtime");
    runtimeLogger.log("debug", "init", "Creating evaluation runtime");

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

    runtimeLogger.log("debug", "init", "Runtime created");
    return runtime;
  }

  async *evaluate(signal?: AbortSignal): AsyncGenerator<PipelineThread> {
    for (const entrypoint of this.#entrypoints) {
      if (signal) signal.throwIfAborted();

      const evalLogger = this.#logger.createScope("evaluate");
      evalLogger.log(
        "debug",
        "entry",
        `Evaluating entrypoint: ${entrypoint.name}`
      );

      const thread = await this.#createThread(entrypoint, signal);

      evalLogger.log(
        "debug",
        "thread",
        `Thread created for ${entrypoint.name}`
      );
      yield thread;
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
