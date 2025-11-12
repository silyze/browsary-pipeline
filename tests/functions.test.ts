import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EvaluationConfig,
  EvaluationNodeContext,
  GenericNode,
  Pipeline,
  PipelineCompiler,
  PipelineEvaluationOptions,
  PipelineFunction,
  PipelineFunctionProvider,
  StandardLibraryProvider,
  hasPipeline,
  waitForPipelineThread,
} from "../lib";
import { Logger, LogSeverity } from "@silyze/logger";
import { NullBrowserProvider } from "@silyze/browser-provider";
import {
  AiAgentConversationState,
  AiModel,
  AiProvider,
  AiResult,
  AnalysisResult,
  ContinuePromptParams,
  PromptParams,
} from "@silyze/browsary-ai-provider";
import type { Pipeline as PackagePipeline } from "@silyze/browsary-pipeline";

class TestLogger extends Logger {
  log<T>(
    severity: LogSeverity,
    _area: string,
    _message: string,
    _meta?: T
  ): void {
    if (severity === "fatal") {
      throw new Error("Fatal log emitted in test");
    }
  }

  createScope(): Logger {
    return new TestLogger();
  }
}

class TestModel extends AiModel<unknown> {
  async prompt(
    _context: unknown,
    _messages: unknown[]
  ): Promise<AiResult<string>> {
    throw new Error("Not implemented");
  }

  async promptWithSchema<T>(
    _context: unknown,
    _messages: unknown[],
    _schema: object
  ): Promise<AiResult<T>> {
    throw new Error("Not implemented");
  }
}

class TestAiProvider extends AiProvider<unknown, unknown> {
  constructor() {
    super(null!, null!);
  }

  createModel<TModelContext>(
    _model: string,
    _context: TModelContext
  ): AiModel<TModelContext> {
    return new TestModel() as unknown as AiModel<TModelContext>;
  }

  async analyze(
    _context: unknown,
    _userPrompt: string,
    _previousPipeline: Record<string, GenericNode>,
    _onMessages?: (message: unknown[]) => Promise<void> | void
  ): Promise<AiResult<AnalysisResult>> {
    throw new Error("Not implemented");
  }

  async generate(
    _context: unknown,
    _analysisResult: AnalysisResult,
    _previousPipeline: Record<string, GenericNode>,
    _onMessages?: (message: unknown[]) => Promise<void> | void
  ): Promise<AiResult<PackagePipeline>> {
    throw new Error("Not implemented");
  }
  async prompt(
    _context: unknown,
    _params: PromptParams
  ): Promise<AiAgentConversationState> {
    throw new Error("Not implemented");
  }
  async continuePrompt(
    _context: unknown,
    _params: ContinuePromptParams
  ): Promise<AiAgentConversationState> {
    throw new Error("Not implemented");
  }
}

function createConfig(): EvaluationConfig {
  return {
    logger: new TestLogger(),
    aiProvider: new TestAiProvider(),
    browserProvider: NullBrowserProvider.default,
    libraryProvider: StandardLibraryProvider,
  };
}

function compilePipeline(source: Record<string, GenericNode>): Pipeline {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(source);
  assert.ok(hasPipeline(result));
  return result.pipeline;
}

class InlineFunctionProvider implements PipelineFunctionProvider {
  #functions: Map<string, PipelineFunction>;

  constructor(functions: PipelineFunction[]) {
    this.#functions = new Map(
      functions.map((fn) => [`${fn.namespace}::${fn.name}`, fn])
    );
  }

  async listNamespaces(): Promise<string[]> {
    return Array.from(
      new Set(Array.from(this.#functions.values(), (fn) => fn.namespace))
    );
  }

  async listFunctions(namespace: string) {
    return Array.from(this.#functions.values())
      .filter((fn) => fn.namespace === namespace)
      .map(({ pipeline: _pipeline, ...descriptor }) => ({ ...descriptor }));
  }

  async getFunction(namespace: string, name: string) {
    return this.#functions.get(`${namespace}::${name}`);
  }
}

async function executePipeline(
  pipeline: Pipeline,
  config: EvaluationConfig,
  options?: PipelineEvaluationOptions
) {
  const evaluation = pipeline.createEvaluation(config, options);
  let lastRuntime;

  for await (const thread of evaluation.evaluate()) {
    await waitForPipelineThread(thread);
    lastRuntime = thread.runtime;
  }

  assert.ok(lastRuntime, "Expected evaluation to produce at least one runtime");
  return lastRuntime!;
}

test("functions::call resolves return values and flattens promises", async () => {
  const functionPipeline = compilePipeline({
    returner: {
      node: "functions::return",
      inputs: {
        value: { type: "constant", value: "Example" },
      },
      outputs: {
        value: "returned",
      },
      dependsOn: [],
    },
  });

  const functionDefinition: PipelineFunction = {
    namespace: "examples",
    name: "promiseReturn",
    metadata: { title: "Promise return" },
    outputType: "function",
    inputs: [],
    outputs: [
      {
        name: "result",
        refType: "string",
        source: { nodeName: "returner", outputName: "returned" },
      },
    ],
    pipeline: functionPipeline,
  };

  const provider = new InlineFunctionProvider([functionDefinition]);

  const pipeline = compilePipeline({
    call: {
      node: "functions::call",
      inputs: {
        identifier: { type: "constant", value: "examples::promiseReturn" },
      },
      outputs: {
        result: "callResult",
      },
      dependsOn: [],
    },
  });

  const runtime = await executePipeline(pipeline, createConfig(), {
    functionProvider: provider,
  });

  assert.equal(runtime.outputs.call.callResult, "Example");
});

test("functions::call result can feed typed string inputs", async () => {
  const functionPipeline = compilePipeline({
    returner: {
      node: "functions::return",
      inputs: {
        value: { type: "constant", value: "Example" },
      },
      outputs: {
        value: "returned",
      },
      dependsOn: [],
    },
  });

  const functionDefinition: PipelineFunction = {
    namespace: "examples",
    name: "stringReturn",
    metadata: { title: "String return" },
    outputType: "function",
    inputs: [],
    outputs: [
      {
        name: "result",
        refType: "string",
        source: { nodeName: "returner", outputName: "returned" },
      },
    ],
    pipeline: functionPipeline,
  };

  const provider = new InlineFunctionProvider([functionDefinition]);

  const pipeline = compilePipeline({
    call: {
      node: "functions::call",
      inputs: {
        identifier: { type: "constant", value: "examples::stringReturn" },
      },
      outputs: {
        result: "message",
      },
      dependsOn: [],
    },
    upper: {
      node: "string::toUpperCase",
      inputs: {
        value: { type: "outputOf", nodeName: "call", outputName: "message" },
      },
      outputs: {
        value: "uppercased",
      },
      dependsOn: ["call"],
    },
  });

  const runtime = await executePipeline(pipeline, createConfig(), {
    functionProvider: provider,
  });

  assert.equal(runtime.outputs.upper.uppercased, "EXAMPLE");
});

test("functions::call collects yielded iterator values", async () => {
  const functionPipeline = compilePipeline({
    first: {
      node: "functions::yield",
      inputs: {
        value: { type: "constant", value: 1 },
      },
      outputs: {
        value: "out",
      },
      dependsOn: [],
    },
    second: {
      node: "functions::yield",
      inputs: {
        value: { type: "constant", value: 2 },
      },
      outputs: {
        value: "out",
      },
      dependsOn: ["first"],
    },
  });

  const functionDefinition: PipelineFunction = {
    namespace: "examples",
    name: "collect",
    metadata: { title: "Collect" },
    outputType: "iterator",
    inputs: [],
    outputs: [],
    pipeline: functionPipeline,
  };

  const provider = new InlineFunctionProvider([functionDefinition]);

  const pipeline = compilePipeline({
    call: {
      node: "functions::call",
      inputs: {
        identifier: { type: "constant", value: "examples::collect" },
      },
      outputs: {
        result: "values",
      },
      dependsOn: [],
    },
  });

  const runtime = await executePipeline(pipeline, createConfig(), {
    functionProvider: provider,
  });

  assert.deepEqual(runtime.outputs.call.values, [1, 2]);
});

test("functions::argument returns values supplied via evaluation options", async () => {
  const pipeline = compilePipeline({
    fetch: {
      node: "functions::argument",
      inputs: {
        name: { type: "constant", value: "token" },
      },
      outputs: {
        value: "captured",
      },
      dependsOn: [],
    },
  });

  const runtime = await executePipeline(pipeline, createConfig(), {
    arguments: { token: "secret" },
  });

  assert.equal(runtime.outputs.fetch.captured, "secret");
});

test("functions::arguments returns the supplied argument object", async () => {
  const pipeline = compilePipeline({
    fetch: {
      node: "functions::arguments",
      inputs: {},
      outputs: {
        value: "all",
      },
      dependsOn: [],
    },
  });

  const args = { token: "secret", count: 3 };
  const runtime = await executePipeline(pipeline, createConfig(), {
    arguments: args,
  });

  assert.deepEqual(runtime.outputs.fetch.all, args);
});

test("functions::yield throws for function output type", async () => {
  const functionPipeline = compilePipeline({
    bad: {
      node: "functions::yield",
      inputs: {
        value: { type: "constant", value: 1 },
      },
      outputs: {
        value: "value",
      },
      dependsOn: [],
    },
  });

  const functionDefinition: PipelineFunction = {
    namespace: "examples",
    name: "invalidYield",
    metadata: { title: "Invalid yield" },
    outputType: "function",
    inputs: [],
    outputs: [],
    pipeline: functionPipeline,
  };

  const provider = new InlineFunctionProvider([functionDefinition]);

  const pipeline = compilePipeline({
    call: {
      node: "functions::call",
      inputs: {
        identifier: { type: "constant", value: "examples::invalidYield" },
      },
      outputs: {
        result: "value",
      },
      dependsOn: [],
    },
  });

  await assert.rejects(
    () =>
      executePipeline(pipeline, createConfig(), { functionProvider: provider }),
    /can only be used when the function output type is 'iterator'/
  );
});

test("functions::return throws for iterator output type", async () => {
  const functionPipeline = compilePipeline({
    bad: {
      node: "functions::return",
      inputs: {
        value: { type: "constant", value: 1 },
      },
      outputs: {
        value: "value",
      },
      dependsOn: [],
    },
  });

  const functionDefinition: PipelineFunction = {
    namespace: "examples",
    name: "invalidReturn",
    metadata: { title: "Invalid return" },
    outputType: "iterator",
    inputs: [],
    outputs: [],
    pipeline: functionPipeline,
  };

  const provider = new InlineFunctionProvider([functionDefinition]);

  const pipeline = compilePipeline({
    call: {
      node: "functions::call",
      inputs: {
        identifier: { type: "constant", value: "examples::invalidReturn" },
      },
      outputs: {
        result: "value",
      },
      dependsOn: [],
    },
  });

  await assert.rejects(
    () =>
      executePipeline(pipeline, createConfig(), { functionProvider: provider }),
    /can only be used when the function output type is 'function'/
  );
});
