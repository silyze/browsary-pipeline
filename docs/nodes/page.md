# page package

- Operations that act on Puppeteer pages or tabs.

### `page::close` — Close page
- Description: Close a tab or page
- Inputs:
  - `page` (page) – The page to close.
- Outputs: (none)
- Notes: Calls Page.close() to tear down the tab.

### `page::goto` — Goto URL
- Description: Navigate to an URL
- Inputs:
  - `page` (page) – Page that should navigate.
  - `url` (string) – Destination URL.
  - `waitUntil` (waitEventType) – Navigation lifecycle event to await (load/domcontentloaded/networkidle0/networkidle2).
- Outputs: (none)
- Notes: Validates waitUntil and forwards to Page.goto with the chosen lifecycle predicate.

### `page::click` — Click element
- Description: Click on a HTML element with a selector
- Inputs:
  - `page` (page) – Page that hosts the element.
  - `selector` (string) – CSS selector to click.
  - `waitForNavigation` (boolean) – Whether to await navigation triggered by the click.
- Outputs: (none)
- Notes: If waitForNavigation is true the node waits for navigation and the click in parallel, preventing race conditions.

### `page::type` — Type in element
- Description: Type in a HTML element with a selector
- Inputs:
  - `page` (page) – Target page.
  - `selector` (string) – CSS selector to type into.
  - `text` (string) – Text to enter.
  - `delayMs` (number) – Delay between key presses in milliseconds.
- Outputs: (none)
- Notes: Delegates to Page.type with the provided delay.
