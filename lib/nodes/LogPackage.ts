import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";

export default class LogPackage extends EvaluationPackage<"log"> {
  readonly [PackageName] = "log";

  info: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("info", "log", value);
    return {};
  };

  warn: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("warn", "log", value);
    return {};
  };

  error: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("error", "log", value);
    return {};
  };

  debug: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("debug", "log", value);
    return {};
  };
}
