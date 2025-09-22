# encoding package

- Text encoding helpers for base64, URI, and HTML escaping.

### `encoding::base64Encode` — Base64 Encode
- Description: Encode a string as base64
- Inputs:
  - `value` (string) – UTF-8 string.
- Outputs:
  - `value` (string) – Base64 encoded string.
- Notes: Uses Buffer.from(value, 'utf8').toString('base64').

### `encoding::base64Decode` — Base64 Decode
- Description: Decode a base64 string
- Inputs:
  - `value` (string) – Base64 encoded input.
- Outputs:
  - `value` (string) – Decoded UTF-8 string.
- Notes: Decodes via Buffer.from(value, 'base64').toString('utf8').

### `encoding::encodeUri` — Encode URI
- Description: Encode a full URI
- Inputs:
  - `value` (string) – URI string.
- Outputs:
  - `value` (string) – encodeURI(value).
- Notes: Encodes reserved characters suitable for full URIs.

### `encoding::decodeUri` — Decode URI
- Description: Decode a full URI
- Inputs:
  - `value` (string) – Encoded URI.
- Outputs:
  - `value` (string) – decodeURI(value).
- Notes: URI decode counterpart.

### `encoding::encodeUriComponent` — Encode URI Component
- Description: Encode a URI component (e.g. query value)
- Inputs:
  - `value` (string) – Component to encode.
- Outputs:
  - `value` (string) – encodeURIComponent(value).
- Notes: Encodes query/path components.

### `encoding::decodeUriComponent` — Decode URI Component
- Description: Decode a URI component
- Inputs:
  - `value` (string) – Encoded component.
- Outputs:
  - `value` (string) – decodeURIComponent(value).
- Notes: Decodes previously encoded component.

### `encoding::escapeHtml` — Escape HTML
- Description: Escape special characters to HTML entities
- Inputs:
  - `value` (string) – Raw HTML text.
- Outputs:
  - `value` (string) – String with &, <, >, " and ' replaced by entities.
- Notes: Protects against HTML interpretation.

### `encoding::unescapeHtml` — Unescape HTML
- Description: Convert HTML entities back to characters
- Inputs:
  - `value` (string) – String containing entities.
- Outputs:
  - `value` (string) – Decoded HTML string.
- Notes: Reverses the escapeHtml transformation.
