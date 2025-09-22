# crypto package

- Cryptographic helpers powered by Web Crypto (UUIDs, hashes, HMAC).

### `crypto::uuid` — Generate UUID
- Description: Create a new UUID v4
- Inputs: (none)
- Outputs:
  - `value` (string) – Random RFC 4122 version 4 UUID.
- Notes: Uses crypto.getRandomValues to construct a UUID.

### `crypto::hashSha256` — Hash SHA-256
- Description: Hash a string using SHA-256
- Inputs:
  - `value` (string) – String to hash (UTF-8).
- Outputs:
  - `value` (string) – Hex encoded SHA-256 digest.
- Notes: Encodes with TextEncoder and digests via crypto.subtle.

### `crypto::hashSha1` — Hash SHA-1
- Description: Hash a string using SHA-1
- Inputs:
  - `value` (string) – String to hash.
- Outputs:
  - `value` (string) – Hex encoded SHA-1 digest.
- Notes: SHA-1 digest (legacy).

### `crypto::hmacSha256` — HMAC SHA-256
- Description: Generate HMAC using SHA-256
- Inputs:
  - `key` (string) – Secret key.
  - `message` (string) – Message to sign.
- Outputs:
  - `value` (string) – Hex encoded HMAC.
- Notes: Imports the key as raw HMAC material and signs message bytes.

### `crypto::randomHex` — Random Hex
- Description: Generate random bytes and return as hex
- Inputs:
  - `bytes` (number) – Number of random bytes.
- Outputs:
  - `value` (string) – Hex string representing the random bytes.
- Notes: Uses crypto.getRandomValues on a Uint8Array and formats as hex.
