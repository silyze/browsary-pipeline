import {
  booleanInputType,
  numberType,
  RefType,
  stringInputType,
  typeDescriptor,
  waitEventType,
  modelType,
  listType,
  objectType,
} from "./schema-base";
import type { GenericNode } from "./evaluation";
import { standardLibrarySchema } from "./nodes";

export {
  RefType,
  stringInputType,
  booleanInputType,
  numberType,
  waitEventType,
  typeDescriptor,
  modelType,
  listType,
  objectType,
};

const GENERIC_NODE_SCHEMA_ID =
  "https://schemas.browsary.com/pipeline/generic-node";
// Use document-local references so schema validators don't treat them as remote.
const ref = (name: string) => `#/$defs/${name}`;

export const genericNodeSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: GENERIC_NODE_SCHEMA_ID,
  type: "object",
  properties: {},
  additionalProperties: {
    $ref: ref("GenericNode"),
  },
  $defs: {
    JsonValue: {
      anyOf: [
        { type: "string" },
        { type: "number" },
        { type: "boolean" },
        { type: "null" },
        {
          type: "object",
          additionalProperties: { $ref: ref("JsonValue") },
        },
        {
          type: "array",
          items: { $ref: ref("JsonValue") },
          additionalItems: false,
        },
      ],
    },
    InputNode: {
      anyOf: [
        {
          type: "object",
          properties: {
            type: { type: "string", const: "constant" },
            value: { $ref: ref("JsonValue") },
          },
          required: ["type", "value"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            type: { type: "string", const: "outputOf" },
            nodeName: { type: "string" },
            outputName: { type: "string" },
          },
          required: ["type", "nodeName", "outputName"],
          additionalProperties: false,
        },
      ],
    },
    Output: {
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            nodeName: { type: "string" },
            outputName: { type: "string" },
          },
          required: ["nodeName", "outputName"],
          additionalProperties: false,
        },
      ],
    },
    Dependency: {
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            nodeName: { type: "string" },
            outputName: { type: "string" },
          },
          required: ["nodeName", "outputName"],
          additionalProperties: false,
        },
      ],
    },
    GenericNode: {
      type: "object",
      properties: {
        node: { type: "string", pattern: "^[^:]+::[^:]+$" },
        inputs: {
          type: "object",
          additionalProperties: { $ref: ref("InputNode") },
        },
        outputs: {
          type: "object",
          additionalProperties: { $ref: ref("Output") },
        },
        dependsOn: {
          anyOf: [
            { $ref: ref("Dependency") },
            {
              type: "array",
              items: { $ref: ref("Dependency") },
            },
          ],
        },
      },
      required: ["node", "inputs", "outputs", "dependsOn"],
      additionalProperties: false,
    },
  },
} as const;

export const pipelineSchema = {
  type: "object",
  properties: {},
  additionalProperties: {
    anyOf: [...standardLibrarySchema],
  },
} as const;

export type PipelineSchema = Record<string, GenericNode>;
