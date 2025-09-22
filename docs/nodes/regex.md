# regex package

- Regular expression helpers for testing, matching, and replacing.

### `regex::test` — Test regex
- Description: Check if a regex matches the string
- Inputs:
  - `pattern` (string) – Regular expression pattern.
  - `value` (string) – String to test.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `value` (boolean) – Result of regex.test.
- Notes: Constructs a RegExp with the provided pattern and flags.

### `regex::match` — Match regex
- Description: Match a regex against the string
- Inputs:
  - `pattern` (string) – Regular expression pattern.
  - `value` (string) – String to match.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `value` (list) – Result of value.match(regex) or [].
- Notes: Returns the first match array or empty array when no match.

### `regex::matchAll` — Match all
- Description: Find all matches of a global regex
- Inputs:
  - `pattern` (string) – Regular expression pattern.
  - `value` (string) – String to search.
  - `flags` (string) – Regex flags (defaults to include 'g').
- Outputs:
  - `value` (list) – Array of arrays representing each match.
- Notes: Ensures the global flag is present and collects value.matchAll results.

### `regex::groups` — Named groups
- Description: Extract named groups from first match
- Inputs:
  - `pattern` (string) – Regex with named groups.
  - `value` (string) – Input string.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `value` (object) – match.groups or {}.
- Notes: Returns named capture groups from the first match or empty object.

### `regex::groupsWithIndex` — Named groups with index
- Description: Return named groups and match index from first match
- Inputs:
  - `pattern` (string) – Regex pattern.
  - `value` (string) – Input string.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `groups` (object) – Named group dictionary ({} when absent).
  - `index` (number) – Match index or -1 when not found.
- Notes: Executes regex.exec to capture both groups and index.

### `regex::matchAllNamed` — Match all named
- Description: Globally match and return named groups with indexes
- Inputs:
  - `pattern` (string) – Regex pattern with named groups.
  - `value` (string) – Input string.
  - `flags` (string) – Regex flags (ensures 'g' is set).
- Outputs:
  - `groups` (list) – Array of group dictionaries for each match.
  - `indexes` (list) – Array of starting indexes for each match.
- Notes: Iterates matchAll, collecting groups where available.

### `regex::replace` — Replace
- Description: Replace the first match of a regex
- Inputs:
  - `pattern` (string) – Regex pattern.
  - `value` (string) – Source string.
  - `replacement` (string) – Replacement text.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `value` (string) – String with first match replaced.
- Notes: Constructs RegExp and calls value.replace.

### `regex::replaceAll` — Replace all
- Description: Replace all matches of a regex
- Inputs:
  - `pattern` (string) – Regex pattern.
  - `value` (string) – Source string.
  - `replacement` (string) – Replacement text.
  - `flags` (string) – Regex flags (defaults to include 'g').
- Outputs:
  - `value` (string) – String with all matches replaced.
- Notes: Ensures global flag and calls replace.

### `regex::split` — Split by regex
- Description: Split a string using a regex pattern
- Inputs:
  - `pattern` (string) – Regex pattern.
  - `value` (string) – Source string.
  - `flags` (string) – Regex flags (optional).
- Outputs:
  - `value` (list) – value.split(regex).
- Notes: Regex-based split.

### `regex::escape` — Escape string for regex
- Description: Escape a string to be used as a regex pattern
- Inputs:
  - `value` (string) – Raw text.
- Outputs:
  - `value` (string) – Pattern-safe version of the string.
- Notes: Escapes regex meta characters with backslashes.

### `regex::unescape` — Unescape regex string
- Description: Unescape a regex-escaped string (basic)
- Inputs:
  - `value` (string) – Escaped string.
- Outputs:
  - `value` (string) – String with simple \-escapes removed.
- Notes: Performs a basic inverse of the escape helper.
