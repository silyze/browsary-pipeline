# page package

- Operations that act on Puppeteer pages or tabs.

### `page::close` - Close page
- Description: Close a tab or page
- Inputs:
  - `page` (page) - The page to close.
- Outputs: (none)
- Notes: Calls `Page.close()` to tear down the tab.

### `page::goto` - Goto URL
- Description: Navigate to a URL
- Inputs:
  - `page` (page) - Page that should navigate.
  - `url` (string) - Destination URL.
  - `waitUntil` (waitEventType) - Navigation lifecycle event to await (`load` / `domcontentloaded` / `networkidle0` / `networkidle2`).
- Outputs: (none)
- Notes: Validates `waitUntil` and forwards to `Page.goto()` with the chosen lifecycle predicate.

### `page::click` - Click element
- Description: Click on a HTML element with a selector
- Inputs:
  - `page` (page) - Page that hosts the element.
  - `selector` (string) - CSS selector to click.
  - `waitForNavigation` (boolean) - Whether to await navigation triggered by the click.
- Outputs: (none)
- Notes: If `waitForNavigation` is true the node waits for navigation and the click in parallel, preventing race conditions.

### `page::type` - Type in element
- Description: Type in a HTML element with a selector
- Inputs:
  - `page` (page) - Target page.
  - `selector` (string) - CSS selector to type into.
  - `text` (string) - Text to enter.
  - `delayMs` (number) - Delay between key presses in milliseconds.
- Outputs: (none)
- Notes: Delegates to `Page.type()` with the provided delay.

### `page::display` - Get page content
- Description: Fetch the current HTML markup of the page
- Inputs:
  - `page` (page) - Page whose DOM should be serialized.
- Outputs:
  - `content` (string) - Full HTML returned by `Page.content()`.
- Notes: Useful for piping HTML into downstream parsing nodes.

### `page::evaluate` - Evaluate expression
- Description: Execute a JavaScript expression in the page context and return its value
- Inputs:
  - `page` (page) - Page whose context should execute the expression.
  - `expression` (string) - JavaScript expression to evaluate (must not be empty).
- Outputs:
  - `result` (any) - Result of the evaluated expression.
- Notes: Trims the expression before execution and throws if it is empty.

### `page::waitForSelector` - Wait for selector
- Description: Wait for a CSS selector to appear within a timeout
- Inputs:
  - `page` (page) - Page that should be observed.
  - `selector` (string) - CSS selector to locate.
  - `timeoutMs` (number) - Maximum time to wait in milliseconds.
- Outputs:
  - `found` (boolean) - True if the selector appeared before the timeout.
- Notes: Disposes the matched handle and treats Puppeteer timeout errors as a `false` result.
