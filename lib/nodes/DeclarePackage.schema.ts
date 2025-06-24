import {
  booleanInputType,
  nodeSchema,
  numberType,
  RefType,
  stringInputType,
} from "../schema-base";

const declareNumber = nodeSchema({
  prefix: "declare",
  action: "number",
  title: "Declare number",
  description: "Declare a constant number value",
  inputs: [{ name: "value", type: numberType, refType: "number" }],
  outputs: [{ name: "value", refType: "number" }],
});

const declareBoolean = nodeSchema({
  prefix: "declare",
  action: "boolean",
  title: "Declare boolean",
  description: "Declare a constant boolean value",
  inputs: [{ name: "value", type: booleanInputType, refType: "boolean" }],
  outputs: [{ name: "value", refType: "boolean" }],
});

const declareString = nodeSchema({
  prefix: "declare",
  action: "string",
  title: "Declare string",
  description: "Declare a constant string value",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [{ name: "value", refType: "string" }],
});

export { RefType };

export default [declareBoolean, declareNumber, declareString];
