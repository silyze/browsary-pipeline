# Evaluation Node Reference

Built-in evaluation packages available in the standard library. Each node mirrors a method on its package class.

## Package Index

- [browser](browser.md) — Puppeteer browser lifecycle helpers used to acquire and dispose browser/page instances.
- [page](page.md) — Operations that act on Puppeteer pages or tabs.
- [ai](ai.md) — Nodes that interact with the configured AiProvider for text or structured outputs.
- [declare](declare.md) — Convenience nodes for seeding constant values into a pipeline graph.
- [logic](logic.md) — General purpose arithmetic, bitwise, comparison, and boolean helpers implemented as inline nodes.
- [math](math.md) — Extended math helpers and constants (numbers in/out unless noted).
- [type](type.md) — Type conversion helpers across numbers, strings, and booleans.
- [string](string.md) — String manipulation primitives.
- [list](list.md) — Mutable list helpers powered by plain JavaScript arrays.
- [object](object.md) — Object key/value manipulation utilities.
- [log](log.md) — Logging wrappers routing messages through the evaluation logger at different severities.
- [json](json.md) — JSON parsing, stringifying, and type guard utilities.
- [regex](regex.md) — Regular expression helpers for testing, matching, and replacing.
- [date](date.md) — Helpers for working with ISO strings, timestamps, and arithmetic in UTC.
- [encoding](encoding.md) — Text encoding helpers for base64, URI, and HTML escaping.
- [http](http.md) — HTTP helpers built on top of fetch (JSON-aware response handling).
- [crypto](crypto.md) — Cryptographic helpers powered by Web Crypto (UUIDs, hashes, HMAC).
- [task](task.md) — Task control utilities.
- [functions](functions.md) — Utilities for invoking reusable pipeline functions and interacting with their runtime state.
