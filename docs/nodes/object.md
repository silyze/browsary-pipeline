# object package

- Object key/value manipulation utilities.

### `object::create` — Create object
- Description: Create an empty object
- Inputs: (none)
- Outputs:
  - `value` (object) – New empty object.
- Notes: Returns {}.

### `object::get` — Get property
- Description: Get a value from an object by key
- Inputs:
  - `object` (object) – Source object.
  - `key` (string) – Property name.
- Outputs:
  - `value` (any) – object[key].
- Notes: Simple property access.

### `object::set` — Set property
- Description: Set a property on an object
- Inputs:
  - `object` (object) – Target object (mutated).
  - `key` (string) – Property name.
  - `value` (any) – Value to assign.
- Outputs: (none)
- Notes: Mutates the object in place.

### `object::delete` — Delete property
- Description: Remove a key from the object
- Inputs:
  - `object` (object) – Target object.
  - `key` (string) – Key to remove.
- Outputs: (none)
- Notes: Deletes the property via delete operator.

### `object::has` — Has property
- Description: Check if a key exists in the object
- Inputs:
  - `object` (object) – Target object.
  - `key` (string) – Key to check.
- Outputs:
  - `value` (boolean) – key in object.
- Notes: Uses the in-operator.

### `object::keys` — Keys
- Description: Get the list of keys in the object
- Inputs:
  - `object` (object) – Target object.
- Outputs:
  - `value` (list) – Object.keys(object).
- Notes: Returns enumerable keys.

### `object::values` — Values
- Description: Get the list of values in the object
- Inputs:
  - `object` (object) – Target object.
- Outputs:
  - `value` (list) – Object.values(object).
- Notes: Returns values for enumerable keys.

### `object::entries` — Entries
- Description: Get the list of [key, value] entries
- Inputs:
  - `object` (object) – Target object.
- Outputs:
  - `value` (list) – Object.entries(object).
- Notes: Key/value pairs.

### `object::merge` — Merge objects
- Description: Shallow merge two objects
- Inputs:
  - `a` (object) – Base object.
  - `b` (object) – Overrides.
- Outputs:
  - `value` (object) – Object.assign({}, a, b).
- Notes: Returns a new object with properties from both inputs (b wins conflicts).

### `object::copy` — Copy object
- Description: Create a shallow copy of an object
- Inputs:
  - `object` (object) – Source object.
- Outputs:
  - `value` (object) – Shallow clone via Object.assign.
- Notes: Shallow copy only.

### `object::length` — Object length
- Description: Count number of keys in the object
- Inputs:
  - `object` (object) – Target object.
- Outputs:
  - `value` (number) – Object.keys(object).length.
- Notes: Counts enumerable keys.

### `object::pick` — Pick keys
- Description: Create a new object with selected keys
- Inputs:
  - `object` (object) – Source object.
  - `keys` (list) – String keys to keep.
- Outputs:
  - `value` (object) – New object containing only the requested keys.
- Notes: Builds a shallow copy containing keys that exist and are listed.

### `object::omit` — Omit keys
- Description: Create a new object without selected keys
- Inputs:
  - `object` (object) – Source object.
  - `keys` (list) – String keys to drop.
- Outputs:
  - `value` (object) – Shallow copy excluding the listed keys.
- Notes: Filters out keys found in the provided list.

### `object::entriesToObject` — Entries to object
- Description: Convert list of [key, value] pairs to object
- Inputs:
  - `entries` (list) – Array of two-element [key, value] arrays.
- Outputs:
  - `value` (object) – Object reconstructed from entries (ignores invalid pairs).
- Notes: Builds an object from an array of tuples where the first element is a string.
