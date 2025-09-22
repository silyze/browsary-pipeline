# ai package

- Nodes that interact with the configured AiProvider for text or structured outputs.

### `ai::prompt` — AI Prompt
- Description: Prompt an AI model
- Inputs:
  - `model` (modelType) – Model identifier supported by the AiProvider.
  - `prompt` (string) – User message.
  - `instructions` (string) – System instructions that frame the interaction.
- Outputs:
  - `response` (string) – Raw text returned from the provider (empty string when no result is produced).
- Notes: Creates a model via aiProvider.createModel and calls prompt with system/user messages.

### `ai::promptWithContext` — AI Prompt With Context
- Description: Prompt an AI model with external context
- Inputs:
  - `model` (modelType) – Model identifier.
  - `context` (any) – Arbitrary context object forwarded to the provider.
  - `prompt` (string) – User prompt.
  - `instructions` (string) – System instructions.
- Outputs:
  - `response` (string) – Text response from the provider.
- Notes: Passes the context to model.prompt so that model-specific state can influence the answer.

### `ai::promptWithSchema` — AI Prompt With JSON Schema
- Description: Prompt an AI model and return structured data using a schema
- Inputs:
  - `model` (modelType) – Model identifier.
  - `context` (any) – Context object.
  - `prompt` (string) – User prompt.
  - `instructions` (string) – System instructions.
  - `schema` (object) – JSON schema describing the expected structured output.
- Outputs:
  - `value` (any) – Structured value returned by promptWithSchema.
- Notes: Runs aiProvider.promptWithSchema and returns the parsed schema-compliant payload.
