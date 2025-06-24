import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class DeclarePackage extends EvaluationPackage<"declare"> {
  readonly [PackageName] = "declare";

  number: EvaluationNode = async ({ value }) => {
    assertType(value, "number", "value");
    return { value };
  };

  boolean: EvaluationNode = async ({ value }) => {
    assertType(value, "boolean", "value");
    return { value };
  };

  string: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value };
  };
}
