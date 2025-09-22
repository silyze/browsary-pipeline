# json package

- JSON parsing, stringifying, and type guard utilities.

### `json::parse` — Parse JSON
- Description: Parse a JSON string into a value
- Inputs:
  - `value` (string) – JSON text.
- Outputs:
  - `value` (any) – Parsed value.
- Notes: Uses JSON.parse after validating the input is a string.

### `json::stringify` — Stringify JSON
- Description: Convert a value to a JSON string
- Inputs:
  - `value` (any) – Value to serialize.
- Outputs:
  - `value` (string) – JSON.stringify(value).
- Notes: Serialises using JSON.stringify.

### `json::clone` — Clone value
- Description: Create a deep copy of a JSON-compatible value
- Inputs:
  - `value` (any) – JSON-compatible value.
- Outputs:
  - `value` (any) – Deep clone via JSON.parse(JSON.stringify(value)).
- Notes: Deep clones through JSON serialisation.

### `json::isObject` — Is JSON object
- Description: Check if the value is a plain object
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – True for non-null objects that are not arrays.
- Notes: Type guard for plain objects.

### `json::isArray` — Is JSON array
- Description: Check if the value is an array
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – Array.isArray(value).
- Notes: Array check.

### `json::isString` — Is JSON string
- Description: Check if the value is a string
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – typeof value === 'string'.
- Notes: String guard.

### `json::isNumber` — Is JSON number
- Description: Check if the value is a number
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – typeof value === 'number' && !isNaN(value).
- Notes: Number guard that excludes NaN.

### `json::isBoolean` — Is JSON boolean
- Description: Check if the value is a boolean
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – typeof value === 'boolean'.
- Notes: Boolean guard.

### `json::isNull` — Is null
- Description: Check if the value is null
- Inputs:
  - `value` (any) – Value to test.
- Outputs:
  - `value` (boolean) – value === null.
- Notes: Null guard.
