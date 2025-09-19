import { assert, assertType } from "@mojsoski/assert";
import {
  EvaluationNode,
  EvaluationNodeContext,
  EvaluationRuntime,
  waitForPipelineThread,
} from "../evaluation";
import {
  PipelineFunction,
  PipelineFunctionOutput,
  PipelineFunctionProvider,
  PipelineFunctionResult,
} from "../functions";
import { EvaluationPackage, PackageName } from "../library";
import { description, input, output, title } from "../schema-base";

function ensureProvider(
  provider: PipelineFunctionProvider | undefined
): PipelineFunctionProvider {
  assert(
    provider,
    "Function provider is not configured. Ensure EvaluationConfig.functionProvider is set."
  );

  return provider;
}

function parseIdentifier(identifier: string): { namespace: string; name: string } {
  const [namespace, name] = identifier.split("::");
  assert(
    namespace && name,
    "Function identifier must be in the format 'namespace::name'"
  );

  return { namespace, name };
}

function collectOutput(
  runtimes: EvaluationRuntime[],
  output: PipelineFunctionOutput
): unknown {
  for (const runtime of runtimes) {
    const nodeOutputs = runtime.outputs[output.source.nodeName];
    if (nodeOutputs && output.source.outputName in nodeOutputs) {
      return nodeOutputs[output.source.outputName];
    }
  }

  throw new Error(
    `Function output ${output.source.nodeName}.${output.source.outputName} was not produced`
  );
}

function normalizeArgs(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) {
    return {};
  }

  assert(
    typeof value === "object" && !Array.isArray(value),
    "Function arguments must be an object"
  );

  return value as Record<string, unknown>;
}

function ensureFunctionContext(context: EvaluationNodeContext) {
  const definition = context.runtime.functionDefinition;
  assert(definition, "Function controls can only be used within a function call context");
  const state = context.runtime.functionState;
  assert(state, "Function state was not initialised");
  return { definition, state };
}

function collectFunctionStates(runtimes: EvaluationRuntime[]) {
  return runtimes
    .map((runtime) => runtime.functionState)
    .filter((state): state is NonNullable<EvaluationRuntime['functionState']> => !!state);
}

function createFunctionResult(
  definition: PipelineFunction,
  runtimes: EvaluationRuntime[]
): PipelineFunctionResult {
  const states = collectFunctionStates(runtimes);

  if (definition.outputType === "function") {
    let value: unknown;
    for (const state of states) {
      if (state.hasReturn) {
        value = state.returnValue;
      }
    }
    return { type: "function", returnValue: Promise.resolve(value) };
  }

  async function* iterator() {
    for (const state of states) {
      for (const item of state.yields) {
        yield item;
      }
    }
  }

  return { type: "iterator", iterator: iterator() };
}

async function resolveValue(value: unknown): Promise<unknown> {
  let current = value;

  while (current && typeof (current as PromiseLike<unknown>).then === "function") {
    current = await (current as PromiseLike<unknown>);
  }

  if (current && typeof (current as any)[Symbol.asyncIterator] === "function") {
    const collected: unknown[] = [];
    for await (const item of current as AsyncIterable<unknown>) {
      collected.push(await resolveValue(item));
    }
    return collected;
  }

  return current;
}

async function resolveFunctionResult(result: PipelineFunctionResult): Promise<unknown> {
  if (result.type === "function") {
    return resolveValue(result.returnValue);
  }

  const values: unknown[] = [];
  for await (const item of result.iterator) {
    values.push(await resolveValue(item));
  }
  return values;
}

export default class FunctionsPackage extends EvaluationPackage<"functions"> {
  readonly [PackageName] = "functions";

  @title("Call Function")
  @description("Invoke a reusable pipeline function by identifier")
  @input("identifier", "string")
  @input("args", "object")
  @output("result", "object")
  call: EvaluationNode = async ({ identifier, args }, context) => {
    assertType(identifier, "string", "identifier");
    const provider = ensureProvider(context.runtime.functionProvider);
    const { namespace, name } = parseIdentifier(identifier);
    const fn = await provider.getFunction(namespace, name);

    assert(fn, `Function '${identifier}' was not found`);

    const normalizedArgs = normalizeArgs(args);
    const nestedLogger = context.logger.createScope(`function:${identifier}`);
    const evaluation = fn.pipeline.createEvaluation(
      {
        ...context.config,
        logger: nestedLogger,
        functionProvider: provider,
      },
      {
        arguments: normalizedArgs,
        functionProvider: provider,
        functionDefinition: fn,
      }
    );

    const runtimes: EvaluationRuntime[] = [];

    for await (const thread of evaluation.evaluate(context.signal)) {
      runtimes.push(thread.runtime);
      await waitForPipelineThread(thread);
    }

    const functionResult = createFunctionResult(fn, runtimes);
    const flattenedResult = await resolveFunctionResult(functionResult);

    const outputs: Record<string, unknown> = {};

    for (const outputMeta of fn.outputs) {
      const rawValue = collectOutput(runtimes, outputMeta);
      outputs[outputMeta.name] = await resolveValue(rawValue);
    }

    if (fn.outputs.length === 0 || !("result" in outputs)) {
      outputs.result = flattenedResult;
    }

    return outputs;
  };

  @title("Function Arguments")
  @description("Return all values supplied to the current function invocation")
  @output("value", "object")
  arguments: EvaluationNode = async (_input, context) => {
    return { value: context.runtime.arguments ?? {} };
  };

  @title("Function Yield")
  @description("Yield a value from the current function invocation")
  @input("value", "any")
  @output("value", "any")
  ["yield"]: EvaluationNode = async ({ value }, context) => {
    const { definition, state } = ensureFunctionContext(context);
    assert(
      definition.outputType === "iterator",
      "functions::yield can only be used when the function output type is 'iterator'"
    );
    state.yields.push(value);
    return { value };
  };

  @title("Function Return")
  @description("Return a value from the current function invocation")
  @input("value", "any")
  @output("value", "any")
  ["return"]: EvaluationNode = async ({ value }, context) => {
    const { definition, state } = ensureFunctionContext(context);
    assert(
      definition.outputType === "function",
      "functions::return can only be used when the function output type is 'function'"
    );
    assert(!state.hasReturn, "functions::return was already called for this invocation");
    state.returnValue = value;
    state.hasReturn = true;
    return { value };
  };

  @title("Function Argument")
  @description("Return the value supplied for a named function argument")
  @input("name", "string")
  @output("value", "any")
  argument: EvaluationNode = async ({ name }, context) => {
    assertType(name, "string", "name");
    const args = context.runtime.arguments ?? {};
    return { value: args[name] };
  };
}
