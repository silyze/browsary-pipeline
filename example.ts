import { Logger, LogSeverity } from "@silyze/logger";
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

  check: {
    dependsOn: "counter",
    node: "logic::greaterThan",
    inputs: {
      a: {
        type: "outputOf",
        nodeName: "counter",
        outputName: "value",
      },
      b: { type: "constant", value: 0 },
    },
    outputs: {
      result: "result",
    },
  },
  loop: {
    dependsOn: [{ nodeName: "check", outputName: "result" }, "decrement"],
    node: "log::info",
    inputs: {
      value: {
        type: "constant",
        value: "Test",
      },
    },
    outputs: {},
  },
  decrement: {
    dependsOn: "loop",
    node: "logic::subtract",
    inputs: {
      a: { type: "outputOf", nodeName: "counter", outputName: "value" },
      b: { type: "constant", value: 1 },
    },
    outputs: {
      result: { nodeName: "counter", outputName: "value" },
    },
  },
};

const logger = new (class extends Logger {
  log<T>(severity: LogSeverity, _area: string, message: string): void {
    if (severity === "debug") return;
    if (severity === "error" || severity === "fatal") {
      console.error(message);
    }
    if (severity === "warn") {
      console.warn(message);
    }
    if (severity === "info") {
      console.log(message);
    }
  }
  createScope(): Logger {
    return this;
  }
})();

async function main() {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(pipelineSource);
  if (hasPipeline(result)) {
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
