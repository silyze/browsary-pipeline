import { createJsonLogger } from "@silyze/logger";
import {
  GenericNode,
  hasPipeline,
  PipelineCompiler,
  StandardLibraryProvider,
  waitForPipelineThread,
} from "./lib";
import { NullBrowserProvider } from "@silyze/browser-provider";
const pipelineSource: Record<string, GenericNode> = {
  counter: {
    dependsOn: [],
    node: "declare::number",
    inputs: {
      value: {
        type: "constant",
        value: 10,
      },
    },
    outputs: { value: "value" },
  },

  decrement: {
    dependsOn: ["counter"],
    node: "logic::subtract",
    inputs: {
      a: { type: "outputOf", nodeName: "counter", outputName: "value" },
      b: { type: "constant", value: 1 },
    },
    outputs: {
      result: { nodeName: "counter", inputName: "value" },
    },
  },

  check: {
    dependsOn: ["decrement"],
    node: "logic::greaterThanOrEqual",
    inputs: {
      a: {
        type: "outputOf",
        nodeName: "decrement",
        outputName: "result",
      },
      b: { type: "constant", value: 0 },
    },
    outputs: {
      result: "result",
    },
  },

  loop: {
    dependsOn: [{ nodeName: "check", outputName: "result" }],
    node: "log::info",
    inputs: {
      value: {
        type: "constant",
        value: "Test",
      },
    },
    outputs: {},
  },
};

async function main() {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(pipelineSource);
  if (hasPipeline(result)) {
    const logger = createJsonLogger(console.log);

    const evaluation = result.pipeline.createEvaluation({
      logger,
      browserProvider: NullBrowserProvider.default,
      libraryProvider: StandardLibraryProvider,
      viewport: {
        height: 600,
        width: 800,
      },
    });

    for await (const thread of evaluation.evaluate()) {
      await waitForPipelineThread(thread);
    }
  } else {
    console.error("Pipeline compilation failed:");
    console.error(result.errors);
  }
}

main().then();
