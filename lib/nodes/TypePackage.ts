import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class TypePackage extends EvaluationPackage<"type"> {
  readonly [PackageName] = "type";

  @inline("{ result: $value.toString() }")
  numberToString: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: value.toString() };
  };

  @inline('{ result: $value === true ? "true" : "false" }')
  booleanToString: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value === true ? "true" : "false" };
  };

  @inline("{ result: Number($value) }")
  stringToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { result: Number(value) };
  };

  @inline(
    '{ result: $value.toLowerCase() === "true" ? true : ($value.toLowerCase() === "false" ? false : Boolean($value)) }'
  )
  stringToBoolean: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");

    if (value.toLowerCase() === "true") {
      return { result: true };
    }

    if (value.toLowerCase() === "false") {
      return { result: false };
    }

    return { result: Boolean(value) };
  };

  @inline("{ result: Boolean($value) }")
  numberToBoolean: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: Boolean(value) };
  };

  @inline("{ result: $value ? 1 : 0 }")
  booleanToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value ? 1 : 0 };
  };
}
