import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";
import { title, description, input, output } from "../schema-base";

export default class DeclarePackage extends EvaluationPackage<"declare"> {
  readonly [PackageName] = "declare";

  @title("Declare number")
  @description("Declare a constant number value")
  @input("value", "number")
  @output("value", "number")
  @inline("{ value: $value }")
  number: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value };
  };

  @title("Declare boolean")
  @description("Declare a constant boolean value")
  @input("value", "boolean")
  @output("value", "boolean")
  @inline("{ value: $value }")
  boolean: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { value };
  };

  @title("Declare string")
  @description("Declare a constant string value")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: $value }")
  string: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value };
  };
}
