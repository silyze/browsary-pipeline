import { EvaluationPackage, PackageConfig, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assertType } from "@mojsoski/assert";
import { title, description, input, output } from "../schema-base";

export default class AiPackage extends EvaluationPackage<"ai"> {
  readonly [PackageName] = "ai";

  @title("AI Prompt")
  @description("Prompt an AI model")
  @input("model", "modelType")
  @input("prompt", "string")
  @input("instructions", "string")
  @output("response", "string")
  prompt: EvaluationNode = async ({ model, prompt, instructions }) => {
    assertType(model, "string", "model");
    assertType(prompt, "string", "prompt");
    assertType(instructions, "string", "instructions");
    const aiModel = this[PackageConfig].aiProvider.createModel(model, {});
    const result = await aiModel.prompt({}, [
      { type: "system", content: instructions },
      { type: "user", content: prompt },
    ]);
    return { response: result.result ?? "" };
  };
}
