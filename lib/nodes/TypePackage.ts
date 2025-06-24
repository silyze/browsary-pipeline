import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class TypePackage extends EvaluationPackage<"type"> {
  readonly [PackageName] = "type";

  numberToString: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: value.toString() };
  };

  booleanToString: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value === true ? "true" : "false" };
  };

  stringToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { result: Number(value) };
  };

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

  numberToBoolean: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { result: Boolean(value) };
  };

  booleanToNumber: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { result: value ? 1 : 0 };
  };
}
