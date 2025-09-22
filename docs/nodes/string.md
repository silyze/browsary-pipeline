# string package

- String manipulation primitives.

### `string::create` — Create string
- Description: Create a string value from input
- Inputs:
  - `value` (any) – Value to stringify.
- Outputs:
  - `value` (string) – String(value).
- Notes: Coerces any value to string.

### `string::concat` — Concatenate
- Description: Concatenate two strings
- Inputs:
  - `a` (string) – First string.
  - `b` (string) – Second string.
- Outputs:
  - `value` (string) – a + b.
- Notes: Concatenation.

### `string::toUpperCase` — To upper case
- Description: Convert string to uppercase
- Inputs:
  - `value` (string) – Input string.
- Outputs:
  - `value` (string) – value.toUpperCase().
- Notes: Uppercase conversion.

### `string::toLowerCase` — To lower case
- Description: Convert string to lowercase
- Inputs:
  - `value` (string) – Input string.
- Outputs:
  - `value` (string) – value.toLowerCase().
- Notes: Lowercase conversion.

### `string::trim` — Trim
- Description: Trim whitespace from both ends
- Inputs:
  - `value` (string) – Input string.
- Outputs:
  - `value` (string) – value.trim().
- Notes: Trims whitespace.

### `string::substring` — Substring
- Description: Extract substring from index to end (or toIndex)
- Inputs:
  - `value` (string) – Source string.
  - `from` (number) – Start index.
  - `to` (number) – End index (exclusive).
- Outputs:
  - `value` (string) – value.substring(from, to).
- Notes: Substring extraction.

### `string::includes` — Includes
- Description: Check if the string includes a substring
- Inputs:
  - `value` (string) – Haystack.
  - `search` (string) – Needle.
- Outputs:
  - `value` (boolean) – value.includes(search).
- Notes: Substring containment.

### `string::replaceAll` — Replace all
- Description: Replace all occurrences of a substring
- Inputs:
  - `value` (string) – Source string.
  - `search` (string) – Substring to replace.
  - `replacement` (string) – Replacement text.
- Outputs:
  - `value` (string) – value.replaceAll(search, replacement).
- Notes: Global substring replacement.

### `string::replace` — Replace
- Description: Replace first occurrence of a substring
- Inputs:
  - `value` (string) – Source string.
  - `search` (string) – Substring to replace.
  - `replacement` (string) – Replacement text.
- Outputs:
  - `value` (string) – value.replace(search, replacement).
- Notes: Single replacement (string or regex).

### `string::split` — Split
- Description: Split a string into a list by separator
- Inputs:
  - `value` (string) – Source string.
  - `separator` (string) – Delimiter.
- Outputs:
  - `value` (list) – Array of substrings.
- Notes: String.split.

### `string::startsWith` — Starts with
- Description: Check if the string starts with a prefix
- Inputs:
  - `value` (string) – Source string.
  - `prefix` (string) – Prefix.
- Outputs:
  - `value` (boolean) – value.startsWith(prefix).
- Notes: Prefix check.

### `string::endsWith` — Ends with
- Description: Check if the string ends with a suffix
- Inputs:
  - `value` (string) – Source string.
  - `suffix` (string) – Suffix.
- Outputs:
  - `value` (boolean) – value.endsWith(suffix).
- Notes: Suffix check.

### `string::length` — String length
- Description: Get the length of the string
- Inputs:
  - `value` (string) – Source string.
- Outputs:
  - `value` (number) – value.length.
- Notes: String length.
