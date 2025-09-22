# log package

- Logging wrappers routing messages through the evaluation logger at different severities.

### `log::info` — Log Info
- Description: Log a string to info level
- Inputs:
  - `value` (string) – Message to log.
- Outputs: (none)
- Notes: Calls logger.log('info', 'log', value).

### `log::warn` — Log Warn
- Description: Log a string to warn level
- Inputs:
  - `value` (string) – Message to log.
- Outputs: (none)
- Notes: Logs at warn severity.

### `log::error` — Log Error
- Description: Log a string to error level
- Inputs:
  - `value` (string) – Message to log.
- Outputs: (none)
- Notes: Logs at error severity.

### `log::debug` — Log Debug
- Description: Log a string to debug level
- Inputs:
  - `value` (string) – Message to log.
- Outputs: (none)
- Notes: Logs at debug severity.
