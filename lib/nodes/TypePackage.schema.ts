import {
  booleanInputType,
  nodeSchema,
  numberType,
  RefType,
  stringInputType,
} from "../schema-base";

const numberToString = nodeSchema({
  prefix: "type",
  action: "numberToString",
  title: "Number to String",
  description: "Convert a number to a string",
  inputs: [{ name: "value", type: numberType, refType: "number" }],
  outputs: [{ name: "result", refType: "string" }],
});

const booleanToString = nodeSchema({
  prefix: "type",
  action: "booleanToString",
  title: "Boolean to String",
  description: "Convert a boolean to a string",
  inputs: [{ name: "value", type: booleanInputType, refType: "boolean" }],
  outputs: [{ name: "result", refType: "string" }],
});

const stringToNumber = nodeSchema({
  prefix: "type",
  action: "stringToNumber",
  title: "String to Number",
  description: "Convert a string to a number",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [{ name: "result", refType: "number" }],
});

const stringToBoolean = nodeSchema({
  prefix: "type",
  action: "stringToBoolean",
  title: "String to Boolean",
  description: "Convert a string to a boolean",
  inputs: [{ name: "value", type: stringInputType, refType: "string" }],
  outputs: [{ name: "result", refType: "boolean" }],
});

const numberToBoolean = nodeSchema({
  prefix: "type",
  action: "numberToBoolean",
  title: "Number to Boolean",
  description: "Convert a number to a boolean",
  inputs: [{ name: "value", type: numberType, refType: "number" }],
  outputs: [{ name: "result", refType: "boolean" }],
});

const booleanToNumber = nodeSchema({
  prefix: "type",
  action: "booleanToNumber",
  title: "Boolean to Number",
  description: "Convert a boolean to a number",
  inputs: [{ name: "value", type: booleanInputType, refType: "boolean" }],
  outputs: [{ name: "result", refType: "number" }],
});

export { RefType };

export default [
  numberToString,
  booleanToString,
  stringToNumber,
  stringToBoolean,
  numberToBoolean,
  booleanToNumber,
];
