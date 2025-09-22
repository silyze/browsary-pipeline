# http package

- HTTP helpers built on top of fetch (JSON-aware response handling).

### `http::request` — HTTP Request
- Description: Make an HTTP request with method, headers, and body
- Inputs:
  - `url` (string) – Target URL.
  - `method` (string) – HTTP method name.
  - `headers` (object) – Headers object.
  - `body` (any) – Request payload (stringified for non-GET/HEAD).
- Outputs:
  - `status` (number) – HTTP status code.
  - `headers` (object) – Response headers as plain object.
  - `body` (any) – Parsed JSON if content-type contains application/json, otherwise text.
- Notes: Uppercases the method, stringifies body for non-GET/HEAD, and normalises the response.

### `http::get` — HTTP GET
- Description: Send a GET request with custom headers
- Inputs:
  - `url` (string) – Target URL.
  - `headers` (object) – Headers object.
- Outputs:
  - `status` (number) – HTTP status code.
  - `headers` (object) – Response headers.
  - `body` (any) – Parsed JSON or text using the same logic as http::request.
- Notes: Convenience GET wrapper.

### `http::post` — HTTP POST
- Description: Send a POST request with JSON body and custom headers
- Inputs:
  - `url` (string) – Target URL.
  - `headers` (object) – Headers object.
  - `body` (any) – Payload to JSON.stringify.
- Outputs:
  - `status` (number) – HTTP status code.
  - `headers` (object) – Response headers.
  - `body` (any) – Parsed JSON or text like http::request.
- Notes: Forces Content-Type: application/json and stringifies the body.
