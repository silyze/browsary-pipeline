# functions package

- Utilities for invoking reusable pipeline functions and interacting with their runtime state.

### `functions::call` - Call Function
- Description: Invoke a reusable pipeline function by identifier
- Inputs:
  - `identifier` (string) - Function identifier in the form namespace::name.
  - `args` (object) - Argument object passed to the function (optional).
- Outputs:
  - `result` (any) - Declared `result` output when provided, otherwise the flattened return/iterator value.
- Notes: Looks up the descriptor via PipelineFunctionProvider, evaluates the referenced pipeline, resolves nested yields/returns, and exposes declared outputs as top-level fields alongside `result`.

### `functions::arguments` - Function Arguments
- Description: Return all values supplied to the current function invocation
- Inputs: (none)
- Outputs:
  - `value` (object) - Argument object for the active function call ({} outside a function context).
- Notes: Reads EvaluationRuntime.arguments; useful inside reusable function pipelines.

### `functions::yield` - Function Yield
- Description: Yield a value from the current function invocation
- Inputs:
  - `value` (any) - Value to yield.
- Outputs:
  - `value` (any) - Echoes the yielded value.
- Notes: Available only inside iterator-style functions (outputType === 'iterator'). Appends the value to the function's yield list.

### `functions::return` - Function Return
- Description: Return a value from the current function invocation
- Inputs:
  - `value` (any) - Return value.
- Outputs:
  - `value` (any) - Echoes the returned value.
- Notes: Only valid for functions with outputType === 'function'. Marks the invocation as having returned and stores the value.

### `functions::argument` - Function Argument
- Description: Return the value supplied for a named function argument
- Inputs:
  - `name` (string) - Argument name.
- Outputs:
  - `value` (any) - Value from the arguments object (undefined when missing).
- Notes: Convenient accessor for a single function argument within a reusable pipeline.
