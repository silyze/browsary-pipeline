import { EvaluationPackage, PackageName, PackageConfig } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { input, output, title, description } from "../schema-base";

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

  @title("AI Prompt With Context")
  @description("Prompt an AI model with external context")
  @input("model", "modelType")
  @input("context", "any")
  @input("prompt", "string")
  @input("instructions", "string")
  @output("response", "string")
  promptWithContext: EvaluationNode = async ({
    model,
    context,
    prompt,
    instructions,
  }) => {
    assertType(model, "string", "model");
    assertType(prompt, "string", "prompt");
    assertType(instructions, "string", "instructions");

    const aiModel = this[PackageConfig].aiProvider.createModel<any>(model, {});
    const result = await aiModel.prompt(context, [
      { type: "system", content: instructions },
      { type: "user", content: prompt },
    ]);
    return { response: result.result ?? "" };
  };

  @title("AI Prompt With JSON Schema")
  @description("Prompt an AI model and return structured data using a schema")
  @input("model", "modelType")
  @input("context", "any")
  @input("prompt", "string")
  @input("instructions", "string")
  @input("schema", "object")
  @output("value", "any")
  promptWithSchema: EvaluationNode = async ({
    model,
    context,
    prompt,
    instructions,
    schema,
  }) => {
    assertType(model, "string", "model");
    assertType(prompt, "string", "prompt");
    assertType(instructions, "string", "instructions");
    assertType(schema, "object", "schema");

    const aiModel = this[PackageConfig].aiProvider.createModel<any>(model, {});
    const messages = [
      { type: "system" as "system", content: instructions },
      { type: "user" as "user", content: prompt },
    ];
    const result = await aiModel.promptWithSchema(context, messages, schema);
    return { value: result.result };
  };
}
