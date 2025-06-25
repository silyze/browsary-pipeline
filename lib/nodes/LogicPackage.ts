import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class LogicPackage extends EvaluationPackage<"logic"> {
  readonly [PackageName] = "logic";

  @inline("{ result: $a + $b }")
  add: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a + b };
  };

  @inline("{ result: $a - $b }")
  subtract: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a - b };
  };

  @inline("{ result: $a * $b }")
  multiply: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a * b };
  };

  @inline("{ result: $a / $b }")
  divide: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a / b };
  };

  @inline("{ result: $a % $b }")
  modulus: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a % b };
  };

  @inline("{ result: Math.pow($a, $b) }")
  power: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: Math.pow(a, b) };
  };

  @inline("{ result: -$a }")
  negate: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: -a };
  };

  @inline("{ result: $a & $b }")
  bitwiseAnd: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a & b };
  };

  @inline("{ result: $a | $b }")
  bitwiseOr: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a | b };
  };

  @inline("{ result: $a ^ $b }")
  bitwiseXor: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a ^ b };
  };

  @inline("{ result: ~$a }")
  bitwiseNot: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: ~a };
  };

  @inline("{ result: $a << $b }")
  leftShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a << b };
  };

  @inline("{ result: $a >> $b }")
  rightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >> b };
  };

  @inline("{ result: $a >>> $b }")
  unsignedRightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >>> b };
  };

  @inline("{ result: $a === $b }")
  equal: EvaluationNode = async ({ a, b }) => {
    return { result: a === b };
  };

  @inline("{ result: $a !== $b }")
  notEqual: EvaluationNode = async ({ a, b }) => {
    return { result: a !== b };
  };

  @inline("{ result: $a > $b }")
  greaterThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a > b };
  };

  @inline("{ result: $a >= $b }")
  greaterThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >= b };
  };

  @inline("{ result: $a < $b }")
  lessThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a < b };
  };

  @inline("{ result: $a <= $b }")
  lessThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a <= b };
  };

  @inline("{ result: Boolean($a) && Boolean($b) }")
  and: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) && Boolean(b) };
  };

  @inline("{ result: Boolean($a) || Boolean($b) }")
  or: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) || Boolean(b) };
  };

  @inline("{ result: !Boolean($a) }")
  not: EvaluationNode = async ({ a }) => {
    return { result: !Boolean(a) };
  };
}
