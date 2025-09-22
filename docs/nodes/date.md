# date package

- Helpers for working with ISO strings, timestamps, and arithmetic in UTC.

### `date::now` — Now
- Description: Get the current date and time
- Inputs: (none)
- Outputs:
  - `value` (string) – new Date().toISOString().
- Notes: Current time as ISO string.

### `date::timestamp` — Unix Timestamp
- Description: Current time as seconds since epoch
- Inputs: (none)
- Outputs:
  - `value` (number) – Math.floor(Date.now() / 1000).
- Notes: Seconds since Unix epoch.

### `date::formatIso` — Format ISO Date
- Description: Convert Date object or ISO string to ISO 8601
- Inputs:
  - `value` (string) – Parsable date string.
- Outputs:
  - `value` (string) – new Date(value).toISOString().
- Notes: Normalises to ISO format.

### `date::parse` — Parse Date
- Description: Parse a date string into milliseconds since epoch
- Inputs:
  - `value` (string) – Date string.
- Outputs:
  - `value` (number) – new Date(value).getTime().
- Notes: Milliseconds since epoch.

### `date::addMilliseconds` — Add Milliseconds
- Description: Add milliseconds to a date
- Inputs:
  - `value` (string) – Base ISO date.
  - `ms` (number) – Milliseconds to add.
- Outputs:
  - `value` (string) – ISO string after addition.
- Notes: Adds ms in UTC and returns ISO string.

### `date::diffMilliseconds` — Difference (ms)
- Description: Get difference in milliseconds between two dates
- Inputs:
  - `a` (string) – First ISO date.
  - `b` (string) – Second ISO date.
- Outputs:
  - `value` (number) – new Date(a).getTime() - new Date(b).getTime().
- Notes: UTC difference a minus b.

### `date::extract` — Extract Date Component
- Description: Extract a part of a date (year, month, etc.)
- Inputs:
  - `value` (string) – ISO date string.
  - `part` (string) – One of year, month, day, hour, minute, second, ms, weekday.
- Outputs:
  - `value` (number) – Requested component or NaN if unknown.
- Notes: Uses UTC getters to extract numeric components.

### `date::formatDate` — Format Date
- Description: Format a date using locale and options
- Inputs:
  - `value` (string) – ISO date to format.
  - `locale` (string) – BCP 47 locale string.
  - `options` (object) – Intl.DateTimeFormat options object.
- Outputs:
  - `value` (string) – Formatter output.
- Notes: Creates Intl.DateTimeFormat with provided locale/options and formats the date.

### `date::addDays` — Add Days
- Description: Add days to a date
- Inputs:
  - `value` (string) – ISO date.
  - `days` (number) – Number of days to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts the UTC day component.

### `date::addHours` — Add Hours
- Description: Add hours to a date
- Inputs:
  - `value` (string) – ISO date.
  - `hours` (number) – Hours to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts the UTC hours component.

### `date::addMinutes` — Add Minutes
- Description: Add minutes to a date
- Inputs:
  - `value` (string) – ISO date.
  - `minutes` (number) – Minutes to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts UTC minutes.

### `date::addSeconds` — Add Seconds
- Description: Add seconds to a date
- Inputs:
  - `value` (string) – ISO date.
  - `seconds` (number) – Seconds to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts UTC seconds.

### `date::addYears` — Add Years
- Description: Add years to a date
- Inputs:
  - `value` (string) – ISO date.
  - `years` (number) – Years to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts the UTC full year.

### `date::addMonths` — Add Months
- Description: Add months to a date
- Inputs:
  - `value` (string) – ISO date.
  - `months` (number) – Months to add.
- Outputs:
  - `value` (string) – ISO date after addition.
- Notes: Adjusts the UTC month.
