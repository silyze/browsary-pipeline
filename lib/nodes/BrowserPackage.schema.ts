import { nodeSchema, RefType } from "../schema-base";

const createBrowser = nodeSchema({
  prefix: "browser",
  action: "create",
  title: "Create browser",
  description: "Create a new browser instance",
  inputs: [],
  outputs: [{ name: "browser", refType: "browser" }],
});

const closeBrowser = nodeSchema({
  prefix: "browser",
  action: "close",
  title: "Close browser",
  description: "Closes a browser instance",
  inputs: [{ name: "browser", type: null, refType: "browser" }],
  outputs: [],
});

const createPage = nodeSchema({
  prefix: "browser",
  action: "createPage",
  title: "Create page",
  description: "Create a new tab or page in a browser",
  inputs: [{ name: "browser", type: null, refType: "browser" }],
  outputs: [{ name: "page", refType: "page" }],
});

export type { RefType };
export default [createBrowser, closeBrowser, createPage];
