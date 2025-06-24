import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class LogicPackage extends EvaluationPackage<"logic"> {
  readonly [PackageName] = "logic";

  add: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a + b };
  };

  subtract: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a - b };
  };

  multiply: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a * b };
  };

  divide: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    if (b === 0) throw new Error("Division by zero");
    return { result: a / b };
  };

  modulus: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a % b };
  };

  power: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: Math.pow(a, b) };
  };

  negate: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: -a };
  };

  bitwiseAnd: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a & b };
  };

  bitwiseOr: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a | b };
  };

  bitwiseXor: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a ^ b };
  };

  bitwiseNot: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: ~a };
  };

  leftShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a << b };
  };

  rightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >> b };
  };

  unsignedRightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >>> b };
  };

  equal: EvaluationNode = async ({ a, b }) => {
    return { result: a === b };
  };

  notEqual: EvaluationNode = async ({ a, b }) => {
    return { result: a !== b };
  };

  greaterThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a > b };
  };

  greaterThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >= b };
  };

  lessThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a < b };
  };

  lessThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a <= b };
  };

  and: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) && Boolean(b) };
  };

  or: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) || Boolean(b) };
  };

  not: EvaluationNode = async ({ a }) => {
    return { result: !Boolean(a) };
  };
}
