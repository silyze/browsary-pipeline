# list package

- Mutable list helpers powered by plain JavaScript arrays.

### `list::create` — Create list
- Description: Create an empty list
- Inputs: (none)
- Outputs:
  - `value` (list) – New empty array.
- Notes: Initialises an empty array.

### `list::add` — Add item
- Description: Add an item to a list
- Inputs:
  - `list` (list) – Array to mutate.
  - `item` (any) – Value to append.
- Outputs: (none)
- Notes: Pushes the item onto the array in place.

### `list::join` — Join items
- Description: Join all items into a string
- Inputs:
  - `list` (list) – Array to join.
  - `separator` (string) – Separator string.
- Outputs:
  - `value` (string) – list.join(separator).
- Notes: String join operation.

### `list::get` — Get item at index
- Description: Retrieve an item by its index
- Inputs:
  - `list` (list) – Array.
  - `index` (number) – Zero-based index.
- Outputs:
  - `value` (any) – list[index].
- Notes: Safe direct indexing.

### `list::set` — Set item at index
- Description: Set the value at a specific index
- Inputs:
  - `list` (list) – Array to mutate.
  - `index` (number) – Zero-based index.
  - `value` (any) – Value to assign.
- Outputs: (none)
- Notes: Mutates the array element in place.

### `list::remove` — Remove item at index
- Description: Remove and return the item at the given index
- Inputs:
  - `list` (list) – Array to modify.
  - `index` (number) – Zero-based index.
- Outputs:
  - `value` (any) – The removed element (undefined if index out of range).
- Notes: Uses splice to remove one element.

### `list::length` — Length of list
- Description: Get the number of elements in the list
- Inputs:
  - `list` (list) – Array.
- Outputs:
  - `value` (number) – list.length.
- Notes: Array length.

### `list::slice` — Slice list
- Description: Return a portion of the list
- Inputs:
  - `list` (list) – Source array.
  - `start` (number) – Start index.
  - `end` (number) – End index.
- Outputs:
  - `value` (list) – list.slice(start, end).
- Notes: Non-mutating slice.

### `list::concat` — Concat lists
- Description: Concatenate two lists
- Inputs:
  - `a` (list) – First array.
  - `b` (list) – Second array.
- Outputs:
  - `value` (list) – a.concat(b).
- Notes: Returns a new array with items from both inputs.

### `list::reverse` — Reverse list
- Description: Reverse the order of elements in the list
- Inputs:
  - `list` (list) – Array to reverse.
- Outputs:
  - `value` (list) – A shallow copy in reversed order.
- Notes: Returns a reversed clone (original list untouched).

### `list::sort` — Sort list
- Description: Sort the list (ascending, default)
- Inputs:
  - `list` (list) – Array to sort.
- Outputs:
  - `value` (list) – A shallow copy sorted with default compare.
- Notes: Uses native sort() without custom comparator.

### `list::includes` — Includes item
- Description: Check if the list includes an item
- Inputs:
  - `list` (list) – Array.
  - `item` (any) – Item to locate.
- Outputs:
  - `value` (boolean) – list.includes(item).
- Notes: Array includes check.
