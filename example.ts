import { Logger, LogSeverity } from "@silyze/logger";
import {
  GenericNode,
  hasPipeline,
  PipelineCompiler,
  StandardLibraryProvider,
  waitForPipelineThread,
} from "./lib";
import { NullBrowserProvider } from "@silyze/browser-provider";
import {
  AiModel,
  AiProvider,
  AiResult,
  AnalysisResult,
} from "@silyze/browsary-ai-provider";
import type { Pipeline } from "@silyze/browsary-pipeline";
const pipelineSource: Record<string, GenericNode> = {
  join: {
    node: "list::join",
    outputs: {
      value: "value",
    },
    inputs: {
      list: {
        type: "constant",
        value: ["a", 2],
      },
      separator: {
        type: "constant",
        value: ";",
      },
    },
    dependsOn: [],
  },
  log: {
    node: "log::info",
    outputs: {},
    inputs: {
      value: {
        type: "outputOf",
        nodeName: "join",
        outputName: "value",
      },
    },
    dependsOn: ["join"],
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

class NullModel extends AiModel<object> {
  prompt(): Promise<AiResult<string>> {
    throw new Error("Method not implemented.");
  }
  promptWithSchema<T>(): Promise<AiResult<T>> {
    throw new Error("Method not implemented.");
  }
}

class NullAiProvider extends AiProvider<unknown, unknown> {
  constructor() {
    super(null!, null!);
  }
  createModel<TModelContext>(): AiModel<TModelContext> {
    return new NullModel();
  }
  analyze(): Promise<AiResult<AnalysisResult>> {
    throw new Error("Method not implemented.");
  }
  generate(): Promise<AiResult<Pipeline>> {
    throw new Error("Method not implemented.");
  }
}

async function main() {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(pipelineSource);
  if (hasPipeline(result)) {
    const evaluation = result.pipeline.createEvaluation({
      logger,
      aiProvider: new NullAiProvider(),
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
