import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input } from "../schema-base";

export default class TaskPackage extends EvaluationPackage<"task"> {
  readonly [PackageName] = "task";

  @title("Sleep")
  @description("Pause execution for a given number of milliseconds")
  @input("ms", "number")
  sleep: EvaluationNode = async ({ ms }) => {
    assertType(ms, "number", "ms");
    await new Promise((resolve) => setTimeout(resolve, ms));
    return {};
  };
}
