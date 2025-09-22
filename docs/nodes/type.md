# type package

- Type conversion helpers across numbers, strings, and booleans.

### `type::numberToString` — Number to String
- Description: Convert a number to a string
- Inputs:
  - `value` (number) – Number to convert.
- Outputs:
  - `result` (string) – value.toString().
- Notes: Converts using Number.toString().

### `type::booleanToString` — Boolean to String
- Description: Convert a boolean to a string
- Inputs:
  - `value` (boolean) – Boolean to convert.
- Outputs:
  - `result` (string) – 'true' or 'false' depending on the input.
- Notes: Returns lowercase true/false.

### `type::stringToNumber` — String to Number
- Description: Convert a string to a number
- Inputs:
  - `value` (string) – Numeric string.
- Outputs:
  - `result` (number) – Number(value).
- Notes: Uses Number() casting; non-numeric strings become NaN.

### `type::stringToBoolean` — String to Boolean
- Description: Convert a string to a boolean
- Inputs:
  - `value` (string) – Input string.
- Outputs:
  - `result` (boolean) – true/false for literal matches, otherwise Boolean(value).
- Notes: Case-insensitive true/false mapping with fallback to truthiness.

### `type::numberToBoolean` — Number to Boolean
- Description: Convert a number to a boolean
- Inputs:
  - `value` (number) – Numeric value.
- Outputs:
  - `result` (boolean) – Boolean(value).
- Notes: Zero becomes false, others true.

### `type::booleanToNumber` — Boolean to Number
- Description: Convert a boolean to a number
- Inputs:
  - `value` (boolean) – Boolean value.
- Outputs:
  - `result` (number) – 1 for true, 0 for false.
- Notes: Maps true→1, false→0.
