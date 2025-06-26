import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

export default class MathPackage extends EvaluationPackage<"math"> {
  readonly [PackageName] = "math";

  @title("Absolute Value")
  @description("Return the absolute value of a number")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.abs($value) }")
  abs: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.abs(value) };
  };

  @title("Round")
  @description("Round to the nearest integer")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.round($value) }")
  round: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.round(value) };
  };

  @title("Floor")
  @description("Round down to the nearest integer")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.floor($value) }")
  floor: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.floor(value) };
  };

  @title("Ceiling")
  @description("Round up to the nearest integer")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.ceil($value) }")
  ceil: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.ceil(value) };
  };

  @title("Truncate")
  @description("Truncate a number (remove decimal part)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.trunc($value) }")
  trunc: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.trunc(value) };
  };

  @title("Sign")
  @description("Return the sign of a number (-1, 0, 1)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.sign($value) }")
  sign: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.sign(value) };
  };

  @title("Minimum")
  @description("Return the smaller of two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("value", "number")
  @inline("{ value: Math.min($a, $b) }")
  min: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { value: Math.min(a, b) };
  };

  @title("Maximum")
  @description("Return the larger of two numbers")
  @input("a", "number")
  @input("b", "number")
  @output("value", "number")
  @inline("{ value: Math.max($a, $b) }")
  max: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { value: Math.max(a, b) };
  };

  @title("Clamp")
  @description("Clamp a number between min and max")
  @input("value", "number")
  @input("min", "number")
  @input("max", "number")
  clamp: EvaluationNode = async ({ value, min, max }) => {
    assertType(value, "number", "value");
    assertType(min, "number", "min");
    assertType(max, "number", "max");
    return { value: Math.min(Math.max(value, min), max) };
  };

  @title("Random")
  @description("Return a random number in [0, 1)")
  @output("value", "number")
  @inline("{ value: Math.random() }")
  random: EvaluationNode = async () => {
    return { value: Math.random() };
  };

  @title("Random Range")
  @description("Return a random number in [min, max)")
  @input("min", "number")
  @input("max", "number")
  @output("value", "number")
  randomRange: EvaluationNode = async ({ min, max }) => {
    assertType(min, "number", "min");
    assertType(max, "number", "max");
    return { value: Math.random() * (max - min) + min };
  };

  @title("Square Root")
  @description("Return the square root")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.sqrt($value) }")
  sqrt: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.sqrt(value) };
  };

  @title("Natural Log")
  @description("Return the natural logarithm (base e)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.log($value) }")
  log: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.log(value) };
  };

  @title("Log Base 10")
  @description("Return the base-10 logarithm")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.log10($value) }")
  log10: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.log10(value) };
  };

  @title("Log Base 2")
  @description("Return the base-2 logarithm")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.log2($value) }")
  log2: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.log2(value) };
  };

  @title("Exponential")
  @description("Return e raised to the power of the input")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.exp($value) }")
  exp: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.exp(value) };
  };

  @title("Hypotenuse")
  @description("Return the square root of (a² + b²)")
  @input("a", "number")
  @input("b", "number")
  @output("value", "number")
  @inline("{ value: Math.hypot($a, $b) }")
  hypot: EvaluationNode = async ({ a, b }) => {
    assertType(a, "number", "a");
    assertType(b, "number", "b");
    return { value: Math.hypot(a, b) };
  };

  @title("Sine")
  @description("Compute sine of angle in radians")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.sin($value) }")
  sin: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.sin(value) };
  };

  @title("Cosine")
  @description("Compute cosine of angle in radians")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.cos($value) }")
  cos: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.cos(value) };
  };

  @title("Tangent")
  @description("Compute tangent of angle in radians")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.tan($value) }")
  tan: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.tan(value) };
  };

  @title("Arc Sine")
  @description("Compute arcsin (result in radians)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.asin($value) }")
  asin: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.asin(value) };
  };

  @title("Arc Cosine")
  @description("Compute arccos (result in radians)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.acos($value) }")
  acos: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.acos(value) };
  };

  @title("Arc Tangent")
  @description("Compute arctan (result in radians)")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: Math.atan($value) }")
  atan: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value: Math.atan(value) };
  };

  @title("Arc Tangent 2")
  @description("Compute arctan2(y, x) (result in radians)")
  @input("y", "number")
  @input("x", "number")
  @output("value", "number")
  @inline("{ value: Math.atan2($y, $x) }")
  atan2: EvaluationNode = async ({ y, x }) => {
    assertType(y, "number", "y");
    assertType(x, "number", "x");
    return { value: Math.atan2(y, x) };
  };
  @title("To Radians")
  @description("Convert degrees to radians")
  @input("degrees", "number")
  @output("value", "number")
  @inline("{ value: $degrees * (Math.PI / 180) }")
  toRadians: EvaluationNode = async ({ degrees }) => {
    assertType(degrees, "number", "degrees");
    return { value: degrees * (Math.PI / 180) };
  };

  @title("To Degrees")
  @description("Convert radians to degrees")
  @input("radians", "number")
  @output("value", "number")
  @inline("{ value: $radians * (180 / Math.PI) }")
  toDegrees: EvaluationNode = async ({ radians }) => {
    assertType(radians, "number", "radians");
    return { value: radians * (180 / Math.PI) };
  };

  @title("PI")
  @description("Mathematical constant π")
  @output("value", "number")
  @inline("{ value: Math.PI }")
  pi: EvaluationNode = async () => ({ value: Math.PI });

  @title("E")
  @description("Euler's number (e)")
  @output("value", "number")
  @inline("{ value: Math.E }")
  e: EvaluationNode = async () => ({ value: Math.E });

  @title("LN2")
  @description("Natural log of 2")
  @output("value", "number")
  @inline("{ value: Math.LN2 }")
  ln2: EvaluationNode = async () => ({ value: Math.LN2 });

  @title("LN10")
  @description("Natural log of 10")
  @output("value", "number")
  @inline("{ value: Math.LN10 }")
  ln10: EvaluationNode = async () => ({ value: Math.LN10 });

  @title("LOG2E")
  @description("Log base 2 of e")
  @output("value", "number")
  @inline("{ value: Math.LOG2E }")
  log2e: EvaluationNode = async () => ({ value: Math.LOG2E });

  @title("LOG10E")
  @description("Log base 10 of e")
  @output("value", "number")
  @inline("{ value: Math.LOG10E }")
  log10e: EvaluationNode = async () => ({ value: Math.LOG10E });

  @title("SQRT2")
  @description("Square root of 2")
  @output("value", "number")
  @inline("{ value: Math.SQRT2 }")
  sqrt2: EvaluationNode = async () => ({ value: Math.SQRT2 });

  @title("SQRT1_2")
  @description("Square root of 1/2")
  @output("value", "number")
  @inline("{ value: Math.SQRT1_2 }")
  sqrt1_2: EvaluationNode = async () => ({ value: Math.SQRT1_2 });
}
