# Pipeline Functions

Pipeline functions let you bundle a pipeline graph behind a named entrypoint and call it from other pipelines. A function is described by static metadata (namespace, name, inputs, outputs) and a compiled `Pipeline` instance that the `functions` package can execute on demand.

## Descriptor Model

Each function is described by a `PipelineFunctionDescriptor`:

- `namespace` and `name` uniquely identify the function.
- `metadata` provides human-facing `title`, optional `description`, `icon`, and `image` fields.
- `outputType` is either `"function"` (single return value) or `"iterator"` (zero or more yields).
- `inputs` is a list of `PipelineFunctionParameter` items, each with a `name`, `refType`, and optional `description`.
- `outputs` is a list of `PipelineFunctionOutput` entries. Every output declares a `name`, `refType`, optional description, and a `source` (`{"nodeName", "outputName"}`) pointing at the pipeline node/output that produces the value.

During execution, the runtime materialises a `PipelineFunction` by supplying a compiled `pipeline` on top of the descriptor.

### Results

Function calls resolve to a `PipelineFunctionResult`:

- `{ "type": "function", "returnValue": Promise }` for single-value functions.
- `{ "type": "iterator", "iterator": AsyncIterable }` for streaming functions.

The `functions::call` node will flatten these structures into plain values (awaiting promises and collecting iterator items) before exposing them to the pipeline as the `result` output, which may hold any JSON-serialisable value.

## Providers

Implement `PipelineFunctionProvider` to expose functions:

- `listNamespaces()` → array of available namespaces.
- `listFunctions(namespace)` → descriptors for that namespace.
- `getFunction(namespace, name)` → returns a `PipelineFunction` when the definition is available.

Providers are typically backed by a registry or database that stores descriptors and precompiled pipelines. When invoking `functions::call` the runtime asserts that a provider is configured (via `EvaluationConfig.functionProvider` or evaluation options).

## Execution Semantics

1. `functions::call` parses the identifier, fetches the function, and normalises the provided argument object (non-object inputs become an empty object).
2. The function pipeline is evaluated while inheriting logger, config, and function provider.
3. The runtime tracks function state:
   - For `"function"` outputType, `functions::return` can be used once to provide a return value.
   - For `"iterator"`, `functions::yield` appends items to the yield buffer.
4. After evaluation finishes, declared outputs are collected using each `source` pointer. Any promises or async iterables produced by nodes are fully resolved.
5. If the function declared zero outputs (or none named `result`), `functions::call` falls back to the flattened return/iterator result as `result`. Any declared outputs are still surfaced alongside this value.

The runtime also exposes `functions::arguments` and `functions::argument` so nested nodes can inspect input values without re-threading them through the graph.


## Example Function Descriptor

The following JSON document shows a fully described function that greets a user and returns the formatted message. The descriptor includes metadata, input/output definitions, and the pipeline graph the runtime executes when the function is called.

```json
{
  "namespace": "utilities",
  "name": "greet_user",
  "metadata": {
    "title": "Greet User",
    "description": "Return a friendly greeting for the provided name."
  },
  "outputType": "function",
  "inputs": [
    {
      "name": "name",
      "refType": "string",
      "description": "Name of the person to greet."
    }
  ],
  "outputs": [
    {
      "name": "message",
      "refType": "string",
      "description": "Formatted greeting message.",
      "source": {
        "nodeName": "format_message",
        "outputName": "value"
      }
    }
  ],
  "pipeline": {
    "declare_prefix": {
      "node": "declare::string",
      "inputs": {
        "value": {
          "type": "constant",
          "value": "Hello, "
        }
      },
      "outputs": {
        "value": "value"
      },
      "dependsOn": []
    },
    "get_name": {
      "node": "functions::argument",
      "inputs": {
        "name": {
          "type": "constant",
          "value": "name"
        }
      },
      "outputs": {
        "value": "value"
      },
      "dependsOn": []
    },
    "format_message": {
      "node": "string::concat",
      "inputs": {
        "a": {
          "type": "outputOf",
          "nodeName": "declare_prefix",
          "outputName": "value"
        },
        "b": {
          "type": "outputOf",
          "nodeName": "get_name",
          "outputName": "value"
        }
      },
      "outputs": {
        "value": "value"
      },
      "dependsOn": ["declare_prefix", "get_name"]
    }
  }
}
```

## Using the functions package

- `functions::call` — Invoke a function by identifier and receive its outputs. Fails if the provider is missing or the function cannot be found.
- `functions::arguments` — Returns the full argument object for the current invocation (`{}` when called outside a function context).
- `functions::argument` — Fetch a single argument by name.
- `functions::return` — Set the return value for `outputType === "function"` pipelines. Calling it twice raises an error.
- `functions::yield` — Emit a value from `outputType === "iterator"` pipelines. Multiple yields are appended in order.

Combine the functions package with the descriptors above to build reusable building blocks that can be versioned, listed, and invoked just like built-in packages.
