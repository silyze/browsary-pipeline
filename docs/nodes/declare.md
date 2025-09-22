# declare package

- Convenience nodes for seeding constant values into a pipeline graph.

### `declare::number` — Declare number
- Description: Declare a constant number value
- Inputs:
  - `value` (number) – Numeric literal to expose.
- Outputs:
  - `value` (number) – The provided constant.
- Notes: Validates the input is a number and returns it unchanged.

### `declare::boolean` — Declare boolean
- Description: Declare a constant boolean value
- Inputs:
  - `value` (boolean) – Boolean literal.
- Outputs:
  - `value` (boolean) – The provided constant.
- Notes: Returns the boolean value after type checking.

### `declare::string` — Declare string
- Description: Declare a constant string value
- Inputs:
  - `value` (string) – String literal.
- Outputs:
  - `value` (string) – The provided constant.
- Notes: Ensures the input is a string and returns it.
