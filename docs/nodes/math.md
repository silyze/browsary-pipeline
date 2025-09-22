# math package

- Extended math helpers and constants (numbers in/out unless noted).

### `math::abs` — Absolute Value
- Description: Return the absolute value of a number
- Inputs:
  - `value` (number) – Number to transform.
- Outputs:
  - `value` (number) – |value|.
- Notes: Wraps Math.abs.

### `math::round` — Round
- Description: Round to the nearest integer
- Inputs:
  - `value` (number) – Value to round.
- Outputs:
  - `value` (number) – Math.round(value).
- Notes: Round half up.

### `math::floor` — Floor
- Description: Round down to the nearest integer
- Inputs:
  - `value` (number) – Value to floor.
- Outputs:
  - `value` (number) – Math.floor(value).
- Notes: Floor function.

### `math::ceil` — Ceiling
- Description: Round up to the nearest integer
- Inputs:
  - `value` (number) – Value to ceil.
- Outputs:
  - `value` (number) – Math.ceil(value).
- Notes: Ceiling function.

### `math::trunc` — Truncate
- Description: Truncate a number (remove decimal part)
- Inputs:
  - `value` (number) – Value to truncate.
- Outputs:
  - `value` (number) – Math.trunc(value).
- Notes: Drops the fractional component.

### `math::sign` — Sign
- Description: Return the sign of a number (-1, 0, 1)
- Inputs:
  - `value` (number) – Input number.
- Outputs:
  - `value` (number) – Math.sign(value).
- Notes: Returns -1, 0, or 1 depending on sign.

### `math::min` — Minimum
- Description: Return the smaller of two numbers
- Inputs:
  - `a` (number) – First candidate.
  - `b` (number) – Second candidate.
- Outputs:
  - `value` (number) – Math.min(a, b).
- Notes: Binary minimum.

### `math::max` — Maximum
- Description: Return the larger of two numbers
- Inputs:
  - `a` (number) – First candidate.
  - `b` (number) – Second candidate.
- Outputs:
  - `value` (number) – Math.max(a, b).
- Notes: Binary maximum.

### `math::clamp` — Clamp
- Description: Clamp a number between min and max
- Inputs:
  - `value` (number) – Value to clamp.
  - `min` (number) – Lower bound.
  - `max` (number) – Upper bound.
- Outputs: (none)
- Notes: Returns Math.min(Math.max(value, min), max). The metadata currently does not expose the return value as an output.

### `math::random` — Random
- Description: Return a random number in [0, 1)
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.random().
- Notes: Uniform random in [0, 1).

### `math::randomRange` — Random Range
- Description: Return a random number in [min, max)
- Inputs:
  - `min` (number) – Lower bound.
  - `max` (number) – Upper bound.
- Outputs:
  - `value` (number) – Random value scaled into [min, max).
- Notes: Scales Math.random() into the requested range.

### `math::sqrt` — Square Root
- Description: Return the square root
- Inputs:
  - `value` (number) – Non-negative input.
- Outputs:
  - `value` (number) – Math.sqrt(value).
- Notes: Square root.

### `math::log` — Natural Log
- Description: Return the natural logarithm (base e)
- Inputs:
  - `value` (number) – Value > 0.
- Outputs:
  - `value` (number) – Math.log(value).
- Notes: Natural logarithm.

### `math::log10` — Log Base 10
- Description: Return the base-10 logarithm
- Inputs:
  - `value` (number) – Value > 0.
- Outputs:
  - `value` (number) – Math.log10(value).
- Notes: Base-10 logarithm.

### `math::log2` — Log Base 2
- Description: Return the base-2 logarithm
- Inputs:
  - `value` (number) – Value > 0.
- Outputs:
  - `value` (number) – Math.log2(value).
- Notes: Base-2 logarithm.

### `math::exp` — Exponential
- Description: Return e raised to the power of the input
- Inputs:
  - `value` (number) – Exponent.
- Outputs:
  - `value` (number) – Math.exp(value).
- Notes: Exponential function.

### `math::hypot` — Hypotenuse
- Description: Return the square root of (a² + b²)
- Inputs:
  - `a` (number) – First leg.
  - `b` (number) – Second leg.
- Outputs:
  - `value` (number) – Math.hypot(a, b).
- Notes: Euclidean norm for two components.

### `math::sin` — Sine
- Description: Compute sine of angle in radians
- Inputs:
  - `value` (number) – Angle in radians.
- Outputs:
  - `value` (number) – Math.sin(value).
- Notes: Sine.

### `math::cos` — Cosine
- Description: Compute cosine of angle in radians
- Inputs:
  - `value` (number) – Angle in radians.
- Outputs:
  - `value` (number) – Math.cos(value).
- Notes: Cosine.

### `math::tan` — Tangent
- Description: Compute tangent of angle in radians
- Inputs:
  - `value` (number) – Angle in radians.
- Outputs:
  - `value` (number) – Math.tan(value).
- Notes: Tangent.

### `math::asin` — Arc Sine
- Description: Compute arcsin (result in radians)
- Inputs:
  - `value` (number) – Input in [-1, 1].
- Outputs:
  - `value` (number) – Math.asin(value).
- Notes: Inverse sine.

### `math::acos` — Arc Cosine
- Description: Compute arccos (result in radians)
- Inputs:
  - `value` (number) – Input in [-1, 1].
- Outputs:
  - `value` (number) – Math.acos(value).
- Notes: Inverse cosine.

### `math::atan` — Arc Tangent
- Description: Compute arctan (result in radians)
- Inputs:
  - `value` (number) – Input value.
- Outputs:
  - `value` (number) – Math.atan(value).
- Notes: Inverse tangent.

### `math::atan2` — Arc Tangent 2
- Description: Compute arctan2(y, x) (result in radians)
- Inputs:
  - `y` (number) – Y component.
  - `x` (number) – X component.
- Outputs:
  - `value` (number) – Math.atan2(y, x).
- Notes: Angle from components.

### `math::toRadians` — To Radians
- Description: Convert degrees to radians
- Inputs:
  - `degrees` (number) – Angle in degrees.
- Outputs:
  - `value` (number) – degrees * (PI / 180).
- Notes: Degree-to-radian conversion.

### `math::toDegrees` — To Degrees
- Description: Convert radians to degrees
- Inputs:
  - `radians` (number) – Angle in radians.
- Outputs:
  - `value` (number) – radians * (180 / Math.PI).
- Notes: Radian-to-degree conversion.

### `math::pi` — PI
- Description: Mathematical constant π
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.PI.
- Notes: Constant π.

### `math::e` — E
- Description: Euler's number (e)
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.E.
- Notes: Constant e.

### `math::ln2` — LN2
- Description: Natural log of 2
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.LN2.
- Notes: Constant ln(2).

### `math::ln10` — LN10
- Description: Natural log of 10
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.LN10.
- Notes: Constant ln(10).

### `math::log2e` — LOG2E
- Description: Log base 2 of e
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.LOG2E.
- Notes: Constant log2(e).

### `math::log10e` — LOG10E
- Description: Log base 10 of e
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.LOG10E.
- Notes: Constant log10(e).

### `math::sqrt2` — SQRT2
- Description: Square root of 2
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.SQRT2.
- Notes: Constant √2.

### `math::sqrt1_2` — SQRT1_2
- Description: Square root of 1/2
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.SQRT1_2.
- Notes: Constant √(1/2).
