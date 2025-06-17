import { JTDDataType } from "ajv/dist/jtd";

export const RefType = Symbol("RefType");

function inputSchema<T extends object | null>(type: T, refType: string) {
  if (type === null) {
    return {
      type: "object",
      properties: {
        type: {
          const: "outputOf",
          type: "string",
          [RefType]: refType,
        },
        nodeName: {
          type: "string",
        },
        outputName: {
          type: "string",
        },
      },
      required: ["type", "nodeName", "outputName"],
      additionalProperties: false,
    };
  }

  return {
    anyOf: [
      {
        type: "object",
        properties: {
          type: {
            const: "outputOf",
            type: "string",
            [RefType]: refType,
          },
          nodeName: {
            type: "string",
          },
          outputName: {
            type: "string",
          },
        },
        required: ["type", "nodeName", "outputName"],
        additionalProperties: false,
      },
      {
        type: "object",
        properties: {
          type: {
            const: "constant",
            type: "string",
          },
          value: type,
        },
        required: ["type", "value"],
        additionalProperties: false,
      },
    ],
  } as const;
}

export const stringInputType = {
  type: "string",
} as const;

export const booleanInputType = {
  type: "boolean",
} as const;

export const integerInputType = {
  type: "integer",
} as const;

export const waitEventType = {
  enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
} as const;

export const typeDescriptor = {
  waitEventType: waitEventType.enum,
  integer: integerInputType.type,
  boolean: booleanInputType.type,
  string: stringInputType.type,
};

function nodeSchema<
  TPrefix extends string,
  TAction extends string,
  TInputs extends {
    name: string;
    optional?: boolean;
    type: object | null;
    refType: string;
  }[],
  TOutputs extends { name: string; refType: string }[]
>(typeDecl: {
  prefix: TPrefix;
  action: TAction;
  title: string;
  description?: string;
  inputs: TInputs;
  outputs: TOutputs;
}) {
  return {
    title: typeDecl.title,
    description: typeDecl.description,
    type: "object",
    properties: {
      node: {
        type: "string",
        const: `${typeDecl.prefix}::${typeDecl.action}`,
      },
      dependsOn: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "array",
            items: {
              type: "string",
            },
          },
        ],
      },
      inputs: {
        type: "object",
        properties: Object.fromEntries(
          typeDecl.inputs.map(
            (input) =>
              [input.name, inputSchema(input.type, input.refType)] as const
          )
        ),
        required: typeDecl.inputs
          .filter((input) => !input.optional)
          .map((input) => input.name),
        additionalProperties: false,
      },
      outputs: {
        type: "object",
        description:
          "The names of the outputs when used as an input for an other node",
        additionalProperties: false,
        properties: Object.fromEntries(
          typeDecl.outputs.map(
            (output) =>
              [
                output.name,
                {
                  type: "string",
                  [RefType]: output.refType,
                },
              ] as const
          )
        ),
        required: typeDecl.outputs.map((item) => item.name),
      },
    },
    required: ["node", "inputs", "outputs", "dependsOn"],
    additionalProperties: false,
  } as const;
}

const createBrowser = nodeSchema({
  prefix: "browser",
  action: "create",
  title: "Create browser",
  description: "Create a new browser instance",
  inputs: [],
  outputs: [{ name: "browser", refType: "browser" }],
});

const closeBrowser = nodeSchema({
  prefix: "browser",
  action: "close",
  title: "Close browser",
  description: "Closes a browser instance",
  inputs: [{ name: "browser", type: null, refType: "browser" }],
  outputs: [],
});

const createPage = nodeSchema({
  prefix: "browser",
  action: "createPage",
  title: "Create page",
  description: "Create a new tab or page in a browser",
  inputs: [{ name: "browser", type: null, refType: "browser" }],
  outputs: [{ name: "page", refType: "page" }],
});

const closePage = nodeSchema({
  prefix: "page",
  action: "close",
  title: "Close page",
  description: "Close a tab or page",
  inputs: [{ name: "page", type: null, refType: "page" }],
  outputs: [],
});

const goto = nodeSchema({
  prefix: "page",
  action: "goto",
  title: "Goto URL",
  description: "Navigate to an URL",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "url", type: stringInputType, refType: "string" },
    { name: "waitUntil", type: waitEventType, refType: "waitEventType" },
  ],
  outputs: [],
});

const click = nodeSchema({
  prefix: "page",
  action: "click",
  title: "Click element",
  description: "Click on a HTML element with a selector",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "selector", type: stringInputType, refType: "string" },
    { name: "waitForNavigation", type: booleanInputType, refType: "boolean" },
  ],
  outputs: [],
});

const type = nodeSchema({
  prefix: "page",
  action: "type",
  title: "Type in element",
  description: "Type in a HTML element with a selector",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "selector", type: stringInputType, refType: "string" },
    { name: "text", type: stringInputType, refType: "string" },
    { name: "delayMs", type: integerInputType, refType: "integer" },
  ],
  outputs: [],
});

const display = nodeSchema({
  prefix: "page",
  action: "display",
  title: "Display selector content",
  description: "Display the content of a HTML element with a selector",
  inputs: [
    { name: "page", type: null, refType: "page" },
    { name: "selector", type: stringInputType, refType: "string" },
  ],
  outputs: [],
});

export const pipelineSchema = {
  type: "object",
  properties: {},
  additionalProperties: {
    anyOf: [
      createBrowser,
      closeBrowser,
      createPage,
      closePage,
      goto,
      click,
      type,
      display,
    ],
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
            type: "array",
            items: { type: "string" },
          },
        ],
      },
      inputs: { type: "object" },
      outputs: { type: "object" },
    },
    required: ["node", "inputs", "outputs", "dependsOn"],
    additionalProperties: true,
  },
} as const;

export type PipelineSchema = JTDDataType<typeof genericNodeSchema>;
