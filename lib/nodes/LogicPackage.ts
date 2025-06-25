import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";
import { title, description, input, output } from "../schema-base";

export default class LogicPackage extends EvaluationPackage<"logic"> {
  readonly [PackageName] = "logic";

  @title("Add")
  @description("Add two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a + $b }")
  add: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a + b };
  };

  @title("Subtract")
  @description("Subtract one number from another")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a - $b }")
  subtract: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a - b };
  };

  @title("Multiply")
  @description("Multiply two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a * $b }")
  multiply: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a * b };
  };

  @title("Divide")
  @description("Divide one number by another")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a / $b }")
  divide: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a / b };
  };

  @title("Modulus")
  @description("Remainder of division")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a % $b }")
  modulus: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a % b };
  };

  @title("Power")
  @description("Raise a number to the power of another")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: Math.pow($a, $b) }")
  power: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: Math.pow(a, b) };
  };

  @title("Negate")
  @description("Negate a number")
  @input("a", "number")
  @output("result", "number")
  @inline("{ result: -$a }")
  negate: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: -a };
  };

  @title("Bitwise AND")
  @description("Bitwise AND between two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a & $b }")
  bitwiseAnd: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a & b };
  };

  @title("Bitwise OR")
  @description("Bitwise OR between two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a | $b }")
  bitwiseOr: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a | b };
  };

  @title("Bitwise XOR")
  @description("Bitwise XOR between two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a ^ $b }")
  bitwiseXor: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a ^ b };
  };

  @title("Bitwise NOT")
  @description("Bitwise NOT of a number")
  @input("a", "number")
  @output("result", "number")
  @inline("{ result: ~$a }")
  bitwiseNot: EvaluationNode = async ({ a }) => {
    assertType(a, "number", "a");
    return { result: ~a };
  };

  @title("Left Shift")
  @description("Left shift a number")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a << $b }")
  leftShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a << b };
  };

  @title("Right Shift")
  @description("Right shift a number")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a >> $b }")
  rightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >> b };
  };

  @title("Unsigned Right Shift")
  @description("Unsigned right shift a number")
  @input("a", "number")
  @input("b", "number")
  @output("result", "number")
  @inline("{ result: $a >>> $b }")
  unsignedRightShift: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >>> b };
  };

  @title("Equal")
  @description("Check if two values are equal")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a === $b }")
  equal: EvaluationNode = async ({ a, b }) => {
    return { result: a === b };
  };

  @title("Not Equal")
  @description("Check if two values are not equal")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a !== $b }")
  notEqual: EvaluationNode = async ({ a, b }) => {
    return { result: a !== b };
  };

  @title("Greater Than")
  @description("Check if a > b")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a > $b }")
  greaterThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a > b };
  };

  @title("Greater Than Or Equal")
  @description("Check if a >= b")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a >= $b }")
  greaterThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a >= b };
  };

  @title("Less Than")
  @description("Check if a < b")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a < $b }")
  lessThan: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a < b };
  };

  @title("Less Than Or Equal")
  @description("Check if a <= b")
  @input("a", "number")
  @input("b", "number")
  @output("result", "boolean")
  @inline("{ result: $a <= $b }")
  lessThanOrEqual: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { result: a <= b };
  };

  @title("Logical AND")
  @description("Logical AND between two values")
  @input("a", "boolean")
  @input("b", "boolean")
  @output("result", "boolean")
  @inline("{ result: Boolean($a) && Boolean($b) }")
  and: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) && Boolean(b) };
  };

  @title("Logical OR")
  @description("Logical OR between two values")
  @input("a", "boolean")
  @input("b", "boolean")
  @output("result", "boolean")
  @inline("{ result: Boolean($a) || Boolean($b) }")
  or: EvaluationNode = async ({ a, b }) => {
    return { result: Boolean(a) || Boolean(b) };
  };

  @title("Logical NOT")
  @description("Logical NOT of a value")
  @input("a", "boolean")
  @output("result", "boolean")
  @inline("{ result: !Boolean($a) }")
  not: EvaluationNode = async ({ a }) => {
    return { result: !Boolean(a) };
  };
}
