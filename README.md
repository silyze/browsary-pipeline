# Browsary Pipeline

Core library for defining, compiling, and executing JSON-defined pipelines in Browsary.

---

## Installation

```bash
npm install @silyze/browsary-pipeline
```

---

## Quick Start

```ts
import { createJsonLogger } from "@silyze/logger";
import {
  hasPipeline,
  PipelineCompiler,
  StandardLibraryProvider,
  waitForPipelineThread,
} from "@silyze/browsary-pipeline";
import { UrlBrowserProvider } from "@silyze/browser-provider";

const pipelineSource = {
  create_browser: {
    node: "browser::create",
    inputs: {},
    outputs: { browser: "browser" },
    dependsOn: [],
  },
  goto_google: {
    node: "page::goto",
    inputs: {
      page: {
        type: "outputOf",
        nodeName: "create_browser",
        outputName: "browser",
      },
      url: { type: "constant", value: "https://www.google.com" },
      waitUntil: { type: "constant", value: "load" },
    },
    outputs: {},
    dependsOn: "create_browser",
  },
};

async function main() {
  const compiler = new PipelineCompiler();
  const result = compiler.compile(pipelineSource);

  if (!hasPipeline(result)) {
    console.error("Compilation errors:", result.errors);
    return;
  }

  const logger = createJsonLogger(console.log);
  const evaluation = result.pipeline.createEvaluation({
    logger,
    browserProvider: new UrlBrowserProvider(),
    libraryProvider: StandardLibraryProvider,
    viewport: { width: 1024, height: 768 },
  });

  try {
    for await (const thread of evaluation.evaluate()) {
      const outputs = await waitForPipelineThread(thread);
      console.log("Thread outputs:", outputs);
    }
  } finally {
    evaluation.stop();
  }
}

main();
```

---

## API Reference

### Classes & Functions

#### `PipelineCompiler`

```ts
constructor(): PipelineCompiler
compile(source: PipelineSchema): PipelineCompileResult
```

- Validates `source` against `pipelineSchema` and returns:

  - `{ errors: PipelineCompileError[] }` on failure
  - `{ errors: []; pipeline: Pipeline }` on success

#### `hasPipeline`

```ts
declare function hasPipeline(
  result: PipelineCompileResult
): result is { pipeline: Pipeline };
```

Type guard for compile results.

#### `waitForPipelineThread`

```ts
declare function waitForPipelineThread(
  thread: PipelineThread
): Promise<Record<string, unknown>>;
```

Awaits a single thread’s completion and returns its outputs.

#### `pipelineSchema`

AJV JSON schema for pipeline definitions.

### Types & Interfaces

#### `PipelineSchema`

```ts
type PipelineSchema = Record<string, GenericNodeDefinition>;
```

#### `GenericNodeDefinition`

```ts
interface GenericNodeDefinition {
  node: string;
  inputs?: Record<string, InputNode>;
  outputs?: Record<string, string>;
  dependsOn?: string | string[];
}
```

#### `InputNode`

```ts
type InputNode =
  | { type: "constant"; value: unknown }
  | { type: "outputOf"; nodeName: string; outputName: string };
```

#### `PipelineCompileResult`

```ts
type PipelineCompileResult =
  | { errors: PipelineCompileError[] }
  | { errors: []; pipeline: Pipeline };
```

#### `Pipeline`

```ts
interface Pipeline {
  createEvaluation(config: EvaluationConfig): PipelineEvaluation;
}
```

#### `PipelineEvaluation`

```ts
interface PipelineEvaluation {
  evaluate(): AsyncIterable<PipelineThread>;
  stop(): void;
}
```

#### `PipelineThread`

Opaque execution path handle. Use `waitForPipelineThread`.

#### `PipelineCompileError`

| Type                                   | Message                                                                                            | Additional Fields                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pipeline-not-object`                  | The pipeline is not an object                                                                      | –                                                                                                                                               |
| `node-not-object`                      | The node is not an object                                                                          | `nodeName`                                                                                                                                      |
| `node-missing-property`                | The node is missing a property                                                                     | `nodeName`, `propertyName`                                                                                                                      |
| `node-invalid-property-type`           | The node has an invalid property type                                                              | `nodeName`, `propertyName`, `expectedType`, `actualType`                                                                                        |
| `node-invalid-property-value`          | The node has an invalid property value                                                             | `nodeName`, `propertyName`, `expectedFormat`, `actualValue`                                                                                     |
| `dependency-not-found`                 | The node has an invalid dependency                                                                 | `nodeName`, `dependency`                                                                                                                        |
| `self-dependency`                      | The depends on itself - this causes an infinite loop                                               | `nodeName`                                                                                                                                      |
| `no-entrypoints`                       | The pipeline has no entrypoints - make sure there is at least a single node with zero dependencies | –                                                                                                                                               |
| `node-type-not-found`                  | The node type was not found                                                                        | `nodeType`, `nodeName`                                                                                                                          |
| `node-not-found`                       | The node was not found                                                                             | `nodeName`                                                                                                                                      |
| `node-type-reference-not-found`        | The node type was not found in reference                                                           | `nodeType`, `nodeName`, `referencedIn`                                                                                                          |
| `node-type-missing-output`             | The output is missing from the node type                                                           | `nodeType`, `nodeName`, `outputName`                                                                                                            |
| `node-type-missing-input`              | The input is missing from the node type                                                            | `nodeType`, `nodeName`, `inputName`                                                                                                             |
| `node-type-input-no-const`             | The input cannot be represented as a constant                                                      | `nodeType`, `nodeName`, `inputName`                                                                                                             |
| `const-input-type-mismatch`            | The input type does not match the expected schema                                                  | `nodeType`, `nodeName`, `inputName`, `value`, `expectedSchema`                                                                                  |
| `node-type-input-no-output-of`         | The input cannot be represented as an output reference                                             | `nodeType`, `nodeName`, `inputName`                                                                                                             |
| `node-input-reference-not-found`       | The node referenced by an input was not found                                                      | `nodeName`, `inputName`, `referenceNodeName`                                                                                                    |
| `output-reference-not-found`           | The output referenced by an input was not found                                                    | `nodeName`, `inputName`, `referenceNodeName`, `referenceOutputName`                                                                             |
| `output-reference-node-type-not-found` | The output node type referenced by an input was not found                                          | `nodeName`, `inputName`, `referenceNodeName`, `referenceNodeType`                                                                               |
| `output-reference-type-not-found`      | The output type was not found in the referenced node type                                          | `nodeName`, `inputName`, `referenceNodeName`, `referenceNodeType`, `referenceOutputName`, `referenceOutput`                                     |
| `ref-input-type-mismatch`              | The referenced output type does not match the input type                                           | `nodeName`, `inputName`, `inputType`, `referenceNodeName`, `referenceNodeType`, `referenceOutputName`, `referenceOutput`, `referenceOutputType` |
| `unreachable-node`                     | The node is not reachable from any entrypoint                                                      | `nodeName`                                                                                                                                      |
| `ref-input-not-dependant`              | The referenced output's node is not a dependency to the input's node                               | `nodeName`, `inputName`, `referenceNodeName`, `referenceOutputName`                                                                             |

```ts
export type PipelineCompileError = {
  type: string;
  message: string;
  [key: string]: unknown;
};
```

#### `EvaluationConfig`

```ts
interface EvaluationConfig {
  logger: Logger;
  browserProvider: BrowserProvider;
  libraryProvider: EvaluationLibrary;
  viewport?: ViewportConfig;
}
```

### StandardLibraryProvider Nodes

Built-in node implementations available via `StandardLibraryProvider`:

| Node                  | Description                               | Inputs                                                              | Outputs            |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------------- | ------------------ |
| `browser::create`     | Launches a new browser instance           | _none_                                                              | `browser`          |
| `browser::close`      | Closes an existing browser instance       | `browser`                                                           | _none_             |
| `browser::createPage` | Opens a new page within a browser         | `browser`                                                           | `page`             |
| `page::close`         | Closes an existing page instance          | `page`                                                              | _none_             |
| `page::goto`          | Navigates a page to a specified URL       | `page`, `url` (string), `waitUntil?` (`load` \| `domcontentloaded`) | _none_             |
| `page::click`         | Clicks an element matching a CSS selector | `page`, `selector` (string)                                         | _none_             |
| `page::type`          | Types text into an input element          | `page`, `selector` (string), `text` (string)                        | _none_             |
| `page::display`       | Retrieves the HTML content of the page    | `page`                                                              | `content` (string) |
