import { EvaluationPackage, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { description, input, output, title } from "../schema-base";

export default class JsonPackage extends EvaluationPackage<"json"> {
  readonly [PackageName] = "json";

  @title("Parse JSON")
  @description("Parse a JSON string into a value")
  @input("value", "string")
  @output("value", "any")
  parse: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: JSON.parse(value) };
  };

  @title("Stringify JSON")
  @description("Convert a value to a JSON string")
  @input("value", "any")
  @output("value", "string")
  stringify: EvaluationNode = async ({ value }) => {
    return { value: JSON.stringify(value) };
  };

  @title("Clone value")
  @description("Create a deep copy of a JSON-compatible value")
  @input("value", "any")
  @output("value", "any")
  clone: EvaluationNode = async ({ value }) => {
    return { value: JSON.parse(JSON.stringify(value)) };
  };

  @title("Is JSON object")
  @description("Check if the value is a plain object")
  @input("value", "any")
  @output("value", "boolean")
  isObject: EvaluationNode = async ({ value }) => {
    return {
      value:
        typeof value === "object" && value !== null && !Array.isArray(value),
    };
  };

  @title("Is JSON array")
  @description("Check if the value is an array")
  @input("value", "any")
  @output("value", "boolean")
  isArray: EvaluationNode = async ({ value }) => {
    return { value: Array.isArray(value) };
  };

  @title("Is JSON string")
  @description("Check if the value is a string")
  @input("value", "any")
  @output("value", "boolean")
  isString: EvaluationNode = async ({ value }) => {
    return { value: typeof value === "string" };
  };

  @title("Is JSON number")
  @description("Check if the value is a number")
  @input("value", "any")
  @output("value", "boolean")
  isNumber: EvaluationNode = async ({ value }) => {
    return { value: typeof value === "number" && !isNaN(value) };
  };

  @title("Is JSON boolean")
  @description("Check if the value is a boolean")
  @input("value", "any")
  @output("value", "boolean")
  isBoolean: EvaluationNode = async ({ value }) => {
    return { value: typeof value === "boolean" };
  };

  @title("Is null")
  @description("Check if the value is null")
  @input("value", "any")
  @output("value", "boolean")
  isNull: EvaluationNode = async ({ value }) => {
    return { value: value === null };
  };
}
