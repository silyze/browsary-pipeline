import { JTDDataType } from "ajv/dist/jtd";
import {
  booleanInputType,
  numberType,
  RefType,
  stringInputType,
  typeDescriptor,
  waitEventType,
} from "./schema-base";
import { standardLibrarySchema } from "./nodes";

export {
  RefType,
  stringInputType,
  booleanInputType,
  numberType,
  waitEventType,
  typeDescriptor,
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
      node: { type: "string" },
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
      inputs: { type: "object" },
      outputs: {
        type: "object",
        additionalProperties: {
          anyOf: [
            { type: "string" },
            {
              type: "object",
              properties: {
                nodeName: { type: "string" },
                inputName: { type: "string" },
              },
              required: ["nodeName", "inputName"],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    required: ["node", "inputs", "outputs", "dependsOn"],
    additionalProperties: true,
  },
} as const;

export type PipelineSchema = JTDDataType<typeof genericNodeSchema>;
