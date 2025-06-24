import { nodeSchema, stringInputType, RefType } from "../schema-base";

const logInfo = nodeSchema({
  prefix: "log",
  action: "info",
  title: "Log Info",
  description: "Log a string to info level",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [],
});

const logWarn = nodeSchema({
  prefix: "log",
  action: "warn",
  title: "Log Warn",
  description: "Log a string to warn level",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [],
});

const logError = nodeSchema({
  prefix: "log",
  action: "error",
  title: "Log Error",
  description: "Log a string to error level",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [],
});

const logDebug = nodeSchema({
  prefix: "log",
  action: "debug",
  title: "Log Debug",
  description: "Log a string to debug level",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [],
});

export type { RefType };
export default [logInfo, logWarn, logError, logDebug];
