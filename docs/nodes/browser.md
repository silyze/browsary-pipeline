# browser package

- Puppeteer browser lifecycle helpers used to acquire and dispose browser/page instances.

### `browser::create` — Create browser
- Description: Create a new browser instance
- Inputs: (none)
- Outputs:
  - `browser` (browser) – Browser instance acquired from the configured BrowserProvider.
- Notes: Grabs a browser via EvaluationConfig.browserProvider and registers a finalizer to release it when the evaluation is cleaned up.

### `browser::close` — Close browser
- Description: Closes a browser instance
- Inputs:
  - `browser` (browser) – Handle to the browser that should be terminated.
- Outputs: (none)
- Notes: Asserts the handle exists and calls Puppeteer Browser.close().

### `browser::createPage` — Create page
- Description: Create a new tab or page in a browser
- Inputs:
  - `browser` (browser) – Browser that should host the new page.
- Outputs:
  - `page` (page) – Newly opened Puppeteer page. Automatically closed when the evaluation GC runs.
- Notes: Creates a page, applies EvaluationConfig.viewport when provided, and registers a finalizer to close the page if it remains open.
