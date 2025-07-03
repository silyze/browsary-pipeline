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
  type: "object",
  properties: {},
  additionalProperties: {
    type: "object",
    properties: {
      node: {
        type: "string",
      },
      inputs: {
        type: "object",
        additionalProperties: {
          anyOf: [
            {
              type: "object",
              properties: {
                type: { const: "constant" },
                value: {},
              },
              required: ["type", "value"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                type: { const: "outputOf" },
                nodeName: { type: "string" },
                outputName: { type: "string" },
              },
              required: ["type", "nodeName", "outputName"],
              additionalProperties: false,
            },
          ],
        },
      },
      outputs: {
        type: "object",
        additionalProperties: {
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
      },
      dependsOn: {
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
          {
            type: "array",
            items: {
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
          },
        ],
      },
    },
    required: ["node", "inputs", "outputs", "dependsOn"],
    additionalProperties: false,
  },
} as const;

export type PipelineSchema = JTDDataType<typeof genericNodeSchema>;
