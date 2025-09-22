# logic package

- General purpose arithmetic, bitwise, comparison, and boolean helpers implemented as inline nodes.

### `logic::add` — Add
- Description: Add two numbers
- Inputs:
  - `a` (number) – First addend.
  - `b` (number) – Second addend.
- Outputs:
  - `result` (number) – Sum of a and b.
- Notes: Uses inline evaluation to compute a + b synchronously.

### `logic::subtract` — Subtract
- Description: Subtract one number from another
- Inputs:
  - `a` (number) – Minuend.
  - `b` (number) – Subtrahend.
- Outputs:
  - `result` (number) – Difference a - b.
- Notes: Inline difference.

### `logic::multiply` — Multiply
- Description: Multiply two numbers
- Inputs:
  - `a` (number) – First factor.
  - `b` (number) – Second factor.
- Outputs:
  - `result` (number) – Product a * b.
- Notes: Inline product.

### `logic::divide` — Divide
- Description: Divide one number by another
- Inputs:
  - `a` (number) – Dividend.
  - `b` (number) – Divisor.
- Outputs:
  - `result` (number) – Quotient a / b (JavaScript semantics).
- Notes: Returns JavaScript division result; caller must guard against division by zero if needed.

### `logic::modulus` — Modulus
- Description: Remainder of division
- Inputs:
  - `a` (number) – Dividend.
  - `b` (number) – Divisor.
- Outputs:
  - `result` (number) – Remainder a % b.
- Notes: Returns JavaScript remainder (sign follows dividend).

### `logic::power` — Power
- Description: Raise a number to the power of another
- Inputs:
  - `a` (number) – Base.
  - `b` (number) – Exponent.
- Outputs:
  - `result` (number) – a raised to b via Math.pow.
- Notes: Inline Math.pow implementation.

### `logic::negate` — Negate
- Description: Negate a number
- Inputs:
  - `a` (number) – Value to negate.
- Outputs:
  - `result` (number) – -a.
- Notes: Simple unary negation.

### `logic::bitwiseAnd` — Bitwise AND
- Description: Bitwise AND between two numbers
- Inputs:
  - `a` (number) – First operand.
  - `b` (number) – Second operand.
- Outputs:
  - `result` (number) – a & b.
- Notes: Performs bitwise AND on 32-bit integers.

### `logic::bitwiseOr` — Bitwise OR
- Description: Bitwise OR between two numbers
- Inputs:
  - `a` (number) – First operand.
  - `b` (number) – Second operand.
- Outputs:
  - `result` (number) – a | b.
- Notes: Bitwise OR.

### `logic::bitwiseXor` — Bitwise XOR
- Description: Bitwise XOR between two numbers
- Inputs:
  - `a` (number) – First operand.
  - `b` (number) – Second operand.
- Outputs:
  - `result` (number) – a ^ b.
- Notes: Bitwise exclusive OR.

### `logic::bitwiseNot` — Bitwise NOT
- Description: Bitwise NOT of a number
- Inputs:
  - `a` (number) – Operand.
- Outputs:
  - `result` (number) – ~a.
- Notes: Bitwise inversion on 32-bit integer representation.

### `logic::leftShift` — Left Shift
- Description: Left shift a number
- Inputs:
  - `a` (number) – Value to shift.
  - `b` (number) – Shift amount.
- Outputs:
  - `result` (number) – a << b.
- Notes: Performs JavaScript left shift.

### `logic::rightShift` — Right Shift
- Description: Right shift a number
- Inputs:
  - `a` (number) – Value to shift.
  - `b` (number) – Shift amount.
- Outputs:
  - `result` (number) – a >> b.
- Notes: Arithmetic right shift preserving sign.

### `logic::unsignedRightShift` — Unsigned Right Shift
- Description: Unsigned right shift a number
- Inputs:
  - `a` (number) – Value to shift.
  - `b` (number) – Shift amount.
- Outputs:
  - `result` (number) – a >>> b.
- Notes: Zero-fills the left bits during the shift.

### `logic::equal` — Equal
- Description: Check if two values are equal
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – Result of a === b.
- Notes: Performs strict equality; although schema lists numbers it behaves like general JavaScript equality.

### `logic::notEqual` — Not Equal
- Description: Check if two values are not equal
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – Result of a !== b.
- Notes: Strict inequality.

### `logic::greaterThan` — Greater Than
- Description: Check if a > b
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – True when a > b.
- Notes: Strict greater-than comparison.

### `logic::greaterThanOrEqual` — Greater Than Or Equal
- Description: Check if a >= b
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – True when a >= b.
- Notes: Greater-or-equal comparison.

### `logic::lessThan` — Less Than
- Description: Check if a < b
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – True when a < b.
- Notes: Strict less-than.

### `logic::lessThanOrEqual` — Less Than Or Equal
- Description: Check if a <= b
- Inputs:
  - `a` (number) – Left operand.
  - `b` (number) – Right operand.
- Outputs:
  - `result` (boolean) – True when a <= b.
- Notes: Less-or-equal comparison.

### `logic::and` — Logical AND
- Description: Logical AND between two values
- Inputs:
  - `a` (boolean) – Left operand (coerced with Boolean()).
  - `b` (boolean) – Right operand (coerced with Boolean()).
- Outputs:
  - `result` (boolean) – Boolean(a) && Boolean(b).
- Notes: Truthiness-based AND; non-boolean inputs are coerced.

### `logic::or` — Logical OR
- Description: Logical OR between two values
- Inputs:
  - `a` (boolean) – Left operand (coerced).
  - `b` (boolean) – Right operand (coerced).
- Outputs:
  - `result` (boolean) – Boolean(a) || Boolean(b).
- Notes: Truthiness-based OR.

### `logic::not` — Logical NOT
- Description: Logical NOT of a value
- Inputs:
  - `a` (boolean) – Operand coerced with Boolean().
- Outputs:
  - `result` (boolean) – !Boolean(a).
- Notes: Returns the inverted truthiness.
