import { JTDDataType } from "ajv/dist/jtd";
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

export const pipelineSchema = {
  type: "object",
  properties: {},
  additionalProperties: {
    anyOf: [...standardLibrarySchema],
  },
} as const;

export const genericNodeSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {},
  additionalProperties: {
    $ref: "#/$defs/GenericNode",
  },
  required: [],
  $defs: {
    JsonValue: {
      anyOf: [
        { type: "string" },
        { type: "number" },
        { type: "boolean" },
        { type: "null" },
        {
          type: "object",
          additionalProperties: { $ref: "#/$defs/JsonValue" },
          required: [],
        },
        {
          type: "array",
          items: { $ref: "#/$defs/JsonValue" },
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
            value: { $ref: "#/$defs/JsonValue" },
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
          additionalProperties: { $ref: "#/$defs/InputNode" },
          required: [],
        },
        outputs: {
          type: "object",
          additionalProperties: { $ref: "#/$defs/Output" },
          required: [],
        },
        dependsOn: {
          anyOf: [
            { $ref: "#/$defs/Dependency" },
            {
              type: "array",
              items: { $ref: "#/$defs/Dependency" },
            },
          ],
        },
      },
      required: ["node", "inputs", "outputs", "dependsOn"],
      additionalProperties: false,
    },
  },
} as const;

export type PipelineSchema = JTDDataType<typeof genericNodeSchema>;
