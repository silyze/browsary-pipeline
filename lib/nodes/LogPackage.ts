import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";
import { title, description, input } from "../schema-base";

export default class LogPackage extends EvaluationPackage<"log"> {
  readonly [PackageName] = "log";

  @title("Log Info")
  @description("Log a string to info level")
  @input("value", "string")
  info: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("info", "log", value);
    return {};
  };

  @title("Log Warn")
  @description("Log a string to warn level")
  @input("value", "string")
  warn: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("warn", "log", value);
    return {};
  };

  @title("Log Error")
  @description("Log a string to error level")
  @input("value", "string")
  error: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("error", "log", value);
    return {};
  };

  @title("Log Debug")
  @description("Log a string to debug level")
  @input("value", "string")
  debug: EvaluationNode = async ({ value }, { logger }) => {
    assertType(value, "string", "value");
    logger.log("debug", "log", value);
    return {};
  };
}
