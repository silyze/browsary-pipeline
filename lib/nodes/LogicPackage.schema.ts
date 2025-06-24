import {
  booleanInputType,
  nodeSchema,
  numberType,
  RefType,
} from "../schema-base";

const add = nodeSchema({
  prefix: "logic",
  action: "add",
  title: "Add",
  description: "Add two numbers",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const subtract = nodeSchema({
  prefix: "logic",
  action: "subtract",
  title: "Subtract",
  description: "Subtract one number from another",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const multiply = nodeSchema({
  prefix: "logic",
  action: "multiply",
  title: "Multiply",
  description: "Multiply two numbers",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const divide = nodeSchema({
  prefix: "logic",
  action: "divide",
  title: "Divide",
  description: "Divide one number by another",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const modulus = nodeSchema({
  prefix: "logic",
  action: "modulus",
  title: "Modulus",
  description: "Remainder of division",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const power = nodeSchema({
  prefix: "logic",
  action: "power",
  title: "Power",
  description: "Raise a number to the power of another",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const negate = nodeSchema({
  prefix: "logic",
  action: "negate",
  title: "Negate",
  description: "Negate a number",
  inputs: [{ name: "a", type: numberType, refType: "number" }],
  outputs: [{ name: "result", refType: "number" }],
});

const bitwiseAnd = nodeSchema({
  prefix: "logic",
  action: "bitwiseAnd",
  title: "Bitwise AND",
  description: "Bitwise AND between two numbers",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const bitwiseOr = nodeSchema({
  prefix: "logic",
  action: "bitwiseOr",
  title: "Bitwise OR",
  description: "Bitwise OR between two numbers",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const bitwiseXor = nodeSchema({
  prefix: "logic",
  action: "bitwiseXor",
  title: "Bitwise XOR",
  description: "Bitwise XOR between two numbers",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const bitwiseNot = nodeSchema({
  prefix: "logic",
  action: "bitwiseNot",
  title: "Bitwise NOT",
  description: "Bitwise NOT of a number",
  inputs: [{ name: "a", type: numberType, refType: "number" }],
  outputs: [{ name: "result", refType: "number" }],
});

const leftShift = nodeSchema({
  prefix: "logic",
  action: "leftShift",
  title: "Left Shift",
  description: "Left shift a number",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const rightShift = nodeSchema({
  prefix: "logic",
  action: "rightShift",
  title: "Right Shift",
  description: "Right shift a number",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const unsignedRightShift = nodeSchema({
  prefix: "logic",
  action: "unsignedRightShift",
  title: "Unsigned Right Shift",
  description: "Unsigned right shift a number",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "number" }],
});

const equal = nodeSchema({
  prefix: "logic",
  action: "equal",
  title: "Equal",
  description: "Check if two values are equal",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const notEqual = nodeSchema({
  prefix: "logic",
  action: "notEqual",
  title: "Not Equal",
  description: "Check if two values are not equal",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const greaterThan = nodeSchema({
  prefix: "logic",
  action: "greaterThan",
  title: "Greater Than",
  description: "Check if a > b",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const greaterThanOrEqual = nodeSchema({
  prefix: "logic",
  action: "greaterThanOrEqual",
  title: "Greater Than Or Equal",
  description: "Check if a >= b",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const lessThan = nodeSchema({
  prefix: "logic",
  action: "lessThan",
  title: "Less Than",
  description: "Check if a < b",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const lessThanOrEqual = nodeSchema({
  prefix: "logic",
  action: "lessThanOrEqual",
  title: "Less Than Or Equal",
  description: "Check if a <= b",
  inputs: [
    { name: "a", type: numberType, refType: "number" },
    { name: "b", type: numberType, refType: "number" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const and = nodeSchema({
  prefix: "logic",
  action: "and",
  title: "Logical AND",
  description: "Logical AND between two values",
  inputs: [
    { name: "a", type: booleanInputType, refType: "boolean" },
    { name: "b", type: booleanInputType, refType: "boolean" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const or = nodeSchema({
  prefix: "logic",
  action: "or",
  title: "Logical OR",
  description: "Logical OR between two values",
  inputs: [
    { name: "a", type: booleanInputType, refType: "boolean" },
    { name: "b", type: booleanInputType, refType: "boolean" },
  ],
  outputs: [{ name: "result", refType: "boolean" }],
});

const not = nodeSchema({
  prefix: "logic",
  action: "not",
  title: "Logical NOT",
  description: "Logical NOT of a value",
  inputs: [{ name: "a", type: booleanInputType, refType: "boolean" }],
  outputs: [{ name: "result", refType: "boolean" }],
});

export type { RefType };

export default [
  add,
  subtract,
  multiply,
  divide,
  modulus,
  power,
  negate,

  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
  unsignedRightShift,

  equal,
  notEqual,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,

  and,
  or,
  not,
];
