import { assertNonNull } from "@mojsoski/assert";
import { EvaluationPackage, PackageName } from "./library";
import { EvaluationConfig } from "./evaluation";
export const RefType = Symbol("RefType");

export type NodeMetadata = {
  title?: string;
  description?: string;
  inputs: {
    name: string;
    type: object | null;
    refType: string;
  }[];
  outputs: { name: string; refType: string }[];
};

export type SchemaMetadata = {
  nodes: {
    [k: string]: NodeMetadata;
  };
};

export function inferLibrary(
  ...packageConstructors: (new (
    config: EvaluationConfig
  ) => EvaluationPackage<string>)[]
) {
  return packageConstructors.map(infer).flat();
}

export function infer<
  T extends new (config: EvaluationConfig) => EvaluationPackage<string>
>(constructor: T) {
  const pkg: EvaluationPackage<string> & Partial<{ __schema: SchemaMetadata }> =
    new constructor({} as EvaluationConfig);

  assertNonNull(pkg.__schema, "package.__schema");

  return Object.entries(pkg.__schema.nodes).map(([action, meta]) =>
    nodeSchema({
      prefix: pkg[PackageName],
      action,
      title: meta.title ?? "No title",
      description: meta.description,
      inputs: meta.inputs.toReversed(),
      outputs: meta.outputs.toReversed(),
    })
  );
}

export function input<T extends EvaluationPackage<string>>(
  name: string,
  refType: string,
  type?: object
): (target: T, propertyKey: string) => void {
  return (target, propertyKey) => {
    const schemaMetadata: SchemaMetadata = ((target as any)["__schema"] ??= {
      nodes: {},
    });
    const nodeMetadata = (schemaMetadata.nodes[propertyKey] ??= {
      inputs: [],
      outputs: [],
    });

    const descriptor = typeDescriptor[refType as keyof typeof typeDescriptor];

    if (!type && descriptor) {
      if (typeof descriptor === "string") {
        type = { type: descriptor };
      } else if (Array.isArray(descriptor)) {
        type = { enum: descriptor };
      } else if (descriptor === null) {
        type = null!;
      }
    }

    nodeMetadata.inputs.push({
      name,
      type: type ?? null,
      refType,
    });
  };
}

export function output<T extends EvaluationPackage<string>>(
  name: string,
  refType: string
): (target: T, propertyKey: string) => void {
  return (target, propertyKey) => {
    const schemaMetadata: SchemaMetadata = ((target as any)["__schema"] ??= {
      nodes: {},
    });
    const nodeMetadata = (schemaMetadata.nodes[propertyKey] ??= {
      inputs: [],
      outputs: [],
    });

    nodeMetadata.outputs.push({ name, refType });
  };
}

export function title<T extends EvaluationPackage<string>>(
  title: string
): (target: T, propertyKey: string) => void {
  return (target, propertyKey) => {
    const schemaMetadata: SchemaMetadata = ((target as any)["__schema"] ??= {
      nodes: {},
    });
    const nodeMetadata = (schemaMetadata.nodes[propertyKey] ??= {
      inputs: [],
      outputs: [],
    });

    nodeMetadata.title = title;
  };
}

export function description<T extends EvaluationPackage<string>>(
  description: string
): (target: T, propertyKey: string) => void {
  return (target, propertyKey) => {
    const schemaMetadata: SchemaMetadata = ((target as any)["__schema"] ??= {
      nodes: {},
    });
    const nodeMetadata = (schemaMetadata.nodes[propertyKey] ??= {
      inputs: [],
      outputs: [],
    });

    nodeMetadata.description = description;
  };
}

export function inputSchema<T extends object | null>(type: T, refType: string) {
  const baseOutputOf = {
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

  if (type === null) {
    return baseOutputOf;
  }

  const constant = {
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
  };

  return {
    anyOf: [baseOutputOf, constant],
  } as const;
}
export const stringInputType = {
  type: "string",
} as const;

export const booleanInputType = {
  type: "boolean",
} as const;

export const numberType = {
  type: "number",
} as const;

export const modelType = {
  enum: ["gpt-4o-mini"],
};
export const waitEventType = {
  enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
} as const;

export const typeDescriptor = {
  waitEventType: waitEventType.enum,
  modelType: modelType.enum,
  number: numberType.type,
  boolean: booleanInputType.type,
  string: stringInputType.type,
  any: null,
};

export function nodeSchema<
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
        description: "Unique identifier in the format 'prefix::action'.",
      },
      dependsOn: {
        description:
          "Defines execution dependencies. Can be a string (node ID), an object reference to a boolean output, or an array of either.",
        anyOf: [
          {
            type: "string",
            description: "Node ID this node depends on unconditionally.",
          },
          {
            type: "object",
            description:
              "Conditional dependency. This node will only run if the referenced output is truthy.",
            properties: {
              nodeName: {
                type: "string",
                description: "Name of the node that produces the output.",
              },
              outputName: {
                type: "string",
                description: "Name of the boolean output to evaluate.",
              },
            },
            required: ["nodeName", "outputName"],
            additionalProperties: false,
          },
          {
            type: "array",
            description:
              "List of dependencies, each being either a node ID or a conditional output reference.",
            items: {
              anyOf: [
                {
                  type: "string",
                  description: "Node ID this node depends on.",
                },
                {
                  type: "object",
                  description:
                    "Conditional dependency based on output of another node.",
                  properties: {
                    nodeName: {
                      type: "string",
                      description: "Name of the node producing the output.",
                    },
                    outputName: {
                      type: "string",
                      description: "Name of the boolean output to evaluate.",
                    },
                  },
                  required: ["nodeName", "outputName"],
                  additionalProperties: false,
                },
              ],
            },
          },
        ],
      },
      inputs: {
        type: "object",
        description:
          "Input bindings for this node. Keys map to inputs declared in the node type.",
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
          "Outputs produced by this node. Keys are the output names, values are either a string or a reference to another output.",
        properties: Object.fromEntries(
          typeDecl.outputs.map(
            (output) =>
              [
                output.name,
                {
                  anyOf: [
                    {
                      type: "string",
                      description: `Output reference of type '${output.refType}'.`,
                      [RefType]: output.refType,
                    },
                    {
                      type: "object",
                      description: `Dynamic output reference to input of another node (type '${output.refType}').`,
                      properties: {
                        nodeName: { type: "string" },
                        inputName: { type: "string" },
                      },
                      required: ["nodeName", "inputName"],
                      additionalProperties: false,
                      [RefType]: output.refType,
                    },
                  ],
                },
              ] as const
          )
        ),
        required: typeDecl.outputs.map((item) => item.name),
        additionalProperties: false,
      },
    },
    required: ["node", "inputs", "outputs", "dependsOn"],
    additionalProperties: false,
  } as const;
}
