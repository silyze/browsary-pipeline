import {
  booleanInputType,
  nodeSchema,
  numberType,
  RefType,
  stringInputType,
  waitEventType,
} from "../schema-base";

const closePage = nodeSchema({
  prefix: "page",
  action: "close",
  title: "Close page",
  description: "Close a tab or page",
  inputs: [{ name: "page", type: null, refType: "page" }],
  outputs: [],
});

const goto = nodeSchema({
  prefix: "page",
  action: "goto",
  title: "Goto URL",
  description: "Navigate to an URL",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "url", type: stringInputType, refType: "string" },
    { name: "waitUntil", type: waitEventType, refType: "waitEventType" },
  ],
  outputs: [],
});

const click = nodeSchema({
  prefix: "page",
  action: "click",
  title: "Click element",
  description: "Click on a HTML element with a selector",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "selector", type: stringInputType, refType: "string" },
    { name: "waitForNavigation", type: booleanInputType, refType: "boolean" },
  ],
  outputs: [],
});

const type = nodeSchema({
  prefix: "page",
  action: "type",
  title: "Type in element",
  description: "Type in a HTML element with a selector",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "selector", type: stringInputType, refType: "string" },
    { name: "text", type: stringInputType, refType: "string" },
    { name: "delayMs", type: numberType, refType: "number" },
  ],
  outputs: [],
});

export type { RefType };
export default [closePage, goto, click, type];
