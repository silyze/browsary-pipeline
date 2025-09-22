# JSON Pipeline Format

Browsary pipelines are JSON (or JSON-compatible) objects that describe a directed graph of evaluation nodes. Each node delegates to an implementation from the standard evaluation library and defines how values flow across the graph. Pipelines are typically compiled with `PipelineCompiler` before execution to catch structural and type issues early.

## Top-Level Structure

A pipeline document is an object whose keys are unique node instance names:

~~~json
{
  "create_browser": { ... },
  "goto_google": { ... }
}
~~~

Each node entry must include the properties below:

| Property   | Type                        | Purpose |
| ---------- | --------------------------- | ------- |
| `node`     | `"package::action"` string | Selects the implementation from the evaluation library. |
| `inputs`   | object                      | Binds declared node inputs to constants or other node outputs. |
| `outputs`  | object                      | Exposes values produced by the node. |
| `dependsOn`| string, object, or array    | Declares execution order and conditional guards. |

The `standard` library exported by `lib/nodes/index.ts` exposes all built-in packages. Custom libraries can be supplied through `EvaluationConfig.libraryProvider`.

## Node Identifiers

The `node` field uses the `package::action` pattern. The package must exist in the configured evaluation library and the action must correspond to a method decorated with schema metadata. For example, `"logic::add"` resolves to the `add` node inside `LogicPackage`.

See [docs/nodes/README.md](nodes/README.md) for a complete list of built-in packages and their actions.

## Dependencies and Execution Order

The `dependsOn` property controls when a node runs:

- **String:** `"other_node"` means the node waits for `other_node` to finish.
- **Object:** { `nodeName`: `"check"`, `outputName`: `"result"` } is a conditional dependency. The node runs only if the referenced output resolves to a truthy boolean.
- **Array:** Combine unconditional and conditional dependencies. Each element must be either a string or an object as described above.

Nodes without dependencies become entrypoints. During execution the compiler expands the dependency graph into one or more evaluation threads. Conditional edges are evaluated at runtime by inspecting the referenced output.

## Looping with Conditional Dependencies

You can build loops by wiring a node's `dependsOn` list to the boolean output of a check node. The pipeline below repeatedly logs a message while a counter stays above zero. The `check` node exposes a boolean, and `loop` depends on that output object; when it becomes `false` the logging node stops running.

~~~json
{
  "counter": {
    "node": "declare::number",
    "inputs": { "value": { "type": "constant", "value": 3 } },
    "outputs": { "value": "current" },
    "dependsOn": []
  },
  "loop": {
    "node": "log::info",
    "inputs": { "value": { "type": "constant", "value": "Tick" } },
    "outputs": {},
    "dependsOn": [
      { "nodeName": "check", "outputName": "keepGoing" }
    ]
  },
  "decrement": {
    "node": "logic::subtract",
    "inputs": {
      "a": { "type": "outputOf", "nodeName": "counter", "outputName": "current" },
      "b": { "type": "constant", "value": 1 }
    },
    "outputs": {
      "result": { "nodeName": "counter", "outputName": "current" }
    },
    "dependsOn": [
      "loop"
    ]
  },
  "check": {
    "node": "logic::greaterThan",
    "inputs": {
      "a": { "type": "outputOf", "nodeName": "counter", "outputName": "current" },
      "b": { "type": "constant", "value": 0 }
    },
    "outputs": { "result": "keepGoing" },
    "dependsOn": [
      "counter",
      "decrement"
    ]
  }
}
~~~

Every time `loop` runs, `decrement` reduces the shared counter. Once `check` reports `false`, the conditional dependency prevents further iterations.

## Inputs

Node inputs are defined by the package metadata. Each binding in `inputs` must match the declared name and type. Two forms are supported:

- **Constant:** { `type`: `"constant"`, `value`: <json> } inline values validated against the input schema.
- **Output reference:** { `type`: `"outputOf"`, `nodeName`: `"producer"`, `outputName`: `"value"` } reads the named output from another node. The referenced node must be an ancestor in the dependency graph, and the output types must be compatible.

During compilation the types inferred from the schema are checked. Referencing a missing node/output or providing a mismatched constant produces a `PipelineCompileError`.

## Outputs

Outputs expose values produced by the node to the rest of the pipeline. Each entry supports two patterns:

- **Alias current node output:** `"result": "value"` means the library output named `result` is stored under `value` for this node instance. Other nodes should reference the alias (`value` in this example).
- **Redirect to another node:** `"result": { "nodeName": "counter", "outputName": "value" }` writes the produced value into another node's output slot. This is useful for accumulator patterns where a downstream node updates state owned by an earlier node.

If a node declares outputs but the pipeline omits a binding, compilation fails. Nodes that do not expose outputs can leave the object empty (`{}`).

## Redirecting Outputs to Another Node

The `outputs` map can write a value into another node's output slot by providing an object with `nodeName` and `outputName`. This is handy for maintaining shared mutable state, such as a running counter.

~~~json
"decrement": {
  "node": "logic::subtract",
  "inputs": {
    "a": { "type": "outputOf", "nodeName": "counter", "outputName": "current" },
    "b": { "type": "constant", "value": 1 }
  },
  "outputs": {
    "result": { "nodeName": "counter", "outputName": "current" }
  },
  "dependsOn": ["loop"]
}
~~~

Here the subtraction node does not expose its own public output. Instead, it writes the new value directly back into the `counter` node so any downstream consumers see the updated state on the next iteration.

## Example Node

~~~json
"goto_google": {
  "node": "page::goto",
  "dependsOn": "create_browser",
  "inputs": {
    "page": { "type": "outputOf", "nodeName": "create_browser", "outputName": "browser" },
    "url": { "type": "constant", "value": "https://www.google.com" },
    "waitUntil": { "type": "constant", "value": "load" }
  },
  "outputs": {}
}
~~~

## Compilation and Validation

Use `PipelineCompiler` to validate pipeline JSON:

~~~ts
const compiler = new PipelineCompiler();
const result = compiler.compile(pipelineSource);
if (!hasPipeline(result)) {
  console.error(result.errors);
  return;
}
~~~

Validation steps include:

- Schema validation against `pipelineSchema` (AJV JTD).
- Verification that the target node type exists in the evaluation library.
- Type checks for constant and referenced inputs.
- Dependency checks (no self-dependency, conditional outputs must be boolean, required upstream links present, entrypoints exist).
- Detection of unreachable nodes and unconditional dependency cycles.

Successful compilation yields a `Pipeline` object. Call `pipeline.createEvaluation(config)` to execute it with runtime providers (`Logger`, `BrowserProvider`, `AiProvider`, etc.). Use `waitForPipelineThread` to join execution threads or inspect streaming events via the async iterator returned by `evaluate()`.

## Inline Nodes

Some nodes are decorated with an `@inline` template. During JIT compilation these templates are expanded directly into JavaScript for improved performance. Inline behavior is transparent to pipeline authors, but it explains why certain seemingly synchronous nodes (e.g. arithmetic helpers) have no asynchronous overhead.

## Building Larger Pipelines

- Break complex workflows into conditional branches by wiring boolean outputs through `dependsOn` objects.
- Use `declare::*` nodes to seed constants that are reused across the graph.
- Combine `logic`, `math`, `string`, `list`, and `object` packages to transform data without leaving the pipeline runtime.
- For reusable workflows, wrap pipelines as functions and invoke them through the `functions` package (see [docs/functions.md](functions.md)).

With these essentials, the JSON representation becomes a concise way to orchestrate browser automation, AI prompting, HTTP calls, and custom logic.
