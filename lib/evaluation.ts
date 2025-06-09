import { assert, assertNonNull } from "@mojsoski/assert";
import { BrowserProvider, ViewportConfig } from "@silyze/browser-provider";
import { Logger, createErrorObject } from "@silyze/logger";
import createResolver, { ResolverWithPromise } from "@silyze/resolver";

export type InputNode =
  | { type: "outputOf"; nodeName: string; outputName: string }
  | { type: "constant"; value: unknown };

export type GenericNode = {
  node: `${string}::${string}`;
  inputs: Record<string, InputNode>;
  outputs: Record<string, string>;
  dependsOn: string | string[];
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
  dependsOn: string[];
  node: `${string}::${string}`;
  inputs: Record<string, InputNode>;
  outputs: Record<string, string>;
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

type PipelineThreadOutputs = Record<string, unknown>;

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
  node: PipelineTreeNode;
  state: PipelineThreadState;
};

export async function waitForPipelineThread(thread: PipelineThread) {
  switch (thread.state.status) {
    case "complete":
      return thread.state.outputs;
    case "pending":
      return await thread.state.promise;
    case "error":
      throw thread.state.error;
  }
}

export class PipelineEvaluation {
  #logger: Logger;
  #library: EvaluationLibrary;
  #entrypoints: PipelineTreeNode[];
  #threads = new Map<string, PipelineThread>();
  #dependencyResolvers = new Map<string, ResolverWithPromise<void>>();
  #forceStopped = false;

  async #evaluateNode(
    node: PipelineTreeNode,
    logger: Logger,
    gc: EvaluationGC
  ): Promise<PipelineThreadOutputs> {
    await Promise.all(
      node.dependsOn.map((nodeName) => this.#waitForNode(nodeName))
    );

    const input = Object.fromEntries(
      Object.entries(node.inputs).map(
        ([inputName, inputNode]) =>
          [inputName, this.#getInput(inputNode)] as [string, unknown]
      )
    );

    logger.log(
      "debug",
      "#evaluateNode",
      `Calling evaluation node ${node.node}`,
      input
    );

    try {
      const evaluationNode = this.#library[node.node];
      assertNonNull(evaluationNode, `#library[${node.node}]`);

      return Object.fromEntries(
        Object.entries(await evaluationNode(input, { logger, gc })).map(
          ([key, value]) => [node.outputs[key], value] as [string, unknown]
        )
      );
    } finally {
      logger.log(
        "debug",
        "#evaluateNode",
        `Evaluation node ${node.node} complete`
      );
    }
  }

  #getInput(inputNode: InputNode) {
    if (inputNode.type === "constant") {
      return inputNode.value;
    }

    const outputThread = this.#threads.get(inputNode.nodeName);
    assertNonNull(outputThread, `#threads[${inputNode.nodeName}]`);
    assert(
      outputThread.state.status === "complete",
      `The thread the node '${inputNode.nodeName}' is not with status 'complete'`
    );

    return outputThread.state.outputs[inputNode.outputName];
  }

  async #waitForNode(nodeName: string) {
    const thread = this.#threads.get(nodeName);
    if (thread) {
      switch (thread.state.status) {
        case "error":
          throw thread.state.error;
        case "pending":
          await thread.state.promise.then();
        case "complete":
          return;
      }
    }

    this.#logger.log(
      "debug",
      "#waitForNode",
      `The node ${nodeName} wasn't started, will wait for it to start before evaluating other nodes`
    );

    const previousResolver = this.#dependencyResolvers.get(nodeName);

    if (previousResolver) {
      await previousResolver.promise;
    } else {
      const resolver = await createResolver<void>();
      this.#dependencyResolvers.set(nodeName, resolver);
      await resolver.promise;
    }
  }

  #createThread(node: PipelineTreeNode, gc: EvaluationGC) {
    const logger = this.#logger.createScope(node.name);
    const promise = this.#evaluateNode(node, logger, gc);
    const thread: PipelineThread = {
      state: { status: "pending", promise },
      node,
    };

    logger.log("debug", "#createThread", `Created thread`);

    promise
      .then((outputs) => {
        thread.state = {
          status: "complete",
          outputs,
        };

        this.#dependencyResolvers.get(node.name)?.resolve();

        logger.log("debug", "#createThread", "Node evaluation completed");
      })
      .catch((e) => {
        thread.state = {
          status: "error",
          error: e,
        };

        this.#dependencyResolvers.get(node.name)?.reject(e);
        logger.log(
          "debug",
          "#createThread",
          "Node evaluation failed",
          createErrorObject(e)
        );
      });
    this.#threads.set(node.name, thread);
    return thread;
  }

  async *#evaluatePath(
    node: PipelineTreeNode,
    gc: EvaluationGC
  ): AsyncGenerator<PipelineThread> {
    if (this.#forceStopped) {
      return;
    }

    const previousThread = this.#threads.get(node.name);
    if (previousThread) {
      this.#logger.log(
        "debug",
        "#evalutePath",
        `Node ${node.name} was already started, returning previous thread`
      );
      yield previousThread;
      await waitForPipelineThread(previousThread);
      return;
    }

    this.#logger.log(
      "debug",
      "#evalutePath",
      `Node ${node.name} isn't started, will create thread for it`
    );
    const currentThread = this.#createThread(node, gc);
    yield currentThread;
    await waitForPipelineThread(currentThread);

    this.#logger.log(
      "debug",
      "#evalutePath",
      `Node ${node.name} has ${node.children.length} descendants`
    );

    for (const childNode of node.children) {
      if (this.#forceStopped) {
        break;
      }

      yield* this.#evaluatePath(childNode, gc);
    }
  }

  async *evaluate(signal?: AbortSignal): AsyncGenerator<PipelineThread> {
    const onAbort = () => {
      this.#forceStopped = true;
    };

    signal?.addEventListener("abort", onAbort);

    const gc = createEvaluationGC(this.#logger);
    try {
      this.#logger.log("info", "evaluate", "Evaluation started");
      for (const entrypoint of this.#entrypoints) {
        if (this.#forceStopped) {
          break;
        }
        yield* this.#evaluatePath(entrypoint, gc);
      }
    } finally {
      signal?.removeEventListener("abort", onAbort);
      gc[EvaluationGCCollect]();
      this.#logger.log("info", "evaluate", "Evaluation ended");
    }
  }

  constructor(entrypoints: PipelineTreeNode[], config: EvaluationConfig) {
    const logger = config.logger.createScope("eval");
    this.#logger = logger;
    this.#entrypoints = entrypoints;
    this.#library = config.libraryProvider(config);
  }
}

function createEvaluationGC(logger: Logger): EvaluationGC {
  const scope = logger.createScope("gc");
  let finalizers: (() => Promise<void> | void)[] = [];
  return {
    registerFinalizer(finalizer: () => Promise<void> | void) {
      scope.log(
        "debug",
        "registerFinalizer",
        `Added finalizer with index: ${finalizer.length}`
      );
      finalizers.push(finalizer);
    },
    async [EvaluationGCCollect]() {
      const collectScope = logger.createScope("#collect");

      const oldFinalizers = finalizers;
      finalizers = [];
      collectScope.log(
        "debug",
        "(start)",
        `Cleaning up ${oldFinalizers.length} finalizers`
      );

      for (let i = oldFinalizers.length - 1; i >= 0; i--) {
        const finalizerScope = collectScope.createScope(i.toFixed(0));
        finalizerScope.log(
          "debug",
          "(loop)",
          `Cleanup for finalizer with index ${i} has started`
        );
        try {
          await oldFinalizers[i]();
          finalizerScope.log("debug", "(loop)", `Cleanup complete`);
        } catch {
          finalizerScope.log("warn", "(loop)", `Cleanup up has failed`);
        }
      }
    },
  };
}
