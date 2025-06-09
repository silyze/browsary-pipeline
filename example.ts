import { createJsonLogger } from "@silyze/logger";
import {
  hasPipeline,
  PipelineCompiler,
  StandardLibraryProvider,
  waitForPipelineThread,
} from "./lib";
import { UrlBrowserProvider } from "@silyze/browser-provider";

const pipelineSource = {
  create_browser: {
    node: "browser::create",
    inputs: {},
    outputs: {
      browser: "browser",
    },
    dependsOn: [],
  },
  create_page: {
    node: "browser::createPage",
    inputs: {
      browser: {
        type: "outputOf",
        nodeName: "create_browser",
        outputName: "browser",
      },
    },
    outputs: {
      page: "page",
    },
    dependsOn: "create_browser",
  },
  goto_target_page: {
    node: "page::goto",
    dependsOn: "create_page",
    inputs: {
      page: {
        type: "outputOf",
        nodeName: "create_page",
        outputName: "page",
      },
      url: {
        type: "constant",
        value: "https://www.google.com",
      },
      waitUntil: {
        type: "constant",
        value: "load",
      },
    },
    outputs: {},
  },
};

async function main() {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(pipelineSource);
  if (hasPipeline(result)) {
    console.log("Pipeline compiled successfully!");
    const logger = createJsonLogger(console.log);

    const evaluation = result.pipeline.createEvaluation({
      logger,
      browserProvider: new UrlBrowserProvider(),
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
