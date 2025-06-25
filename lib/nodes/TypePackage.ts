import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";
import { description, input, output, title } from "../schema-base";

export default class TypePackage extends EvaluationPackage<"type"> {
  readonly [PackageName] = "type";

  @title("Number to String")
  @description("Convert a number to a string")
  @input("value", "number")
  @output("result", "string")
  @inline("{ result: $value.toString() }")
  numberToString: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: value.toString() };
  };

  @title("Boolean to String")
  @description("Convert a boolean to a string")
  @input("value", "boolean")
  @output("result", "string")
  @inline('{ result: $value === true ? "true" : "false" }')
  booleanToString: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value === true ? "true" : "false" };
  };

  @title("String to Number")
  @description("Convert a string to a number")
  @input("value", "string")
  @output("result", "number")
  @inline("{ result: Number($value) }")
  stringToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { result: Number(value) };
  };

  @title("String to Boolean")
  @description("Convert a string to a boolean")
  @input("value", "string")
  @output("result", "boolean")
  @inline(
    '{ result: $value.toLowerCase() === "true" ? true : ($value.toLowerCase() === "false" ? false : Boolean($value)) }'
  )
  stringToBoolean: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    const lower = value.toLowerCase();
    if (lower === "true") return { result: true };
    if (lower === "false") return { result: false };
    return { result: Boolean(value) };
  };

  @title("Number to Boolean")
  @description("Convert a number to a boolean")
  @input("value", "number")
  @output("result", "boolean")
  @inline("{ result: Boolean($value) }")
  numberToBoolean: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: Boolean(value) };
  };

  @title("Boolean to Number")
  @description("Convert a boolean to a number")
  @input("value", "boolean")
  @output("result", "number")
  @inline("{ result: $value ? 1 : 0 }")
  booleanToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value ? 1 : 0 };
  };
}
