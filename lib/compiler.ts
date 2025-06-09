import Ajv from "ajv";
import { assertType, assert } from "@mojsoski/assert";
import {
  pipelineSchema,
  RefType,
  PipelineSchema,
  typeDescriptor,
} from "./schema";
import {
  Pipeline,
  PipelineTreeNode,
  InputNode,
  GenericNode,
} from "./evaluation";
import {
  PipelineCompileError,
  PipelineCompileResult,
  PipelineProvider,
} from "./provider";
const ajv = new Ajv();

type AfterParseCheck =
  | {
      type: "depends-on";
      nodeName: string;
      dependsOn: string | string[];
    }
  | {
      type: "node";
      nodeName: string;
      node: `${string}::${string}`;
    }
  | {
      type: "input-ref";
      nodeName: string;
      input: {
        ref: {
          nodeName: string;
          outputName: string;
        };
        self: { name: string; node: `${string}::${string}` };
      };
    }
  | {
      type: "input-const";
      nodeName: string;
      input: {
        name: string;
        node: `${string}::${string}`;
        value: unknown;
      };
    }
  | {
      type: "output-name";
      nodeName: string;
      output: {
        node: `${string}::${string}`;
        name: string;
      };
    };

const propertiesToCheck = ["node", "inputs", "outputs", "dependsOn"] as const;
const propertyTypes = {
  node: "string",
  inputs: "object",
  outputs: "object",
} as const;

function dfs(visited: Set<string>, node: PipelineTreeNode) {
  if (visited.has(node.name)) return;
  visited.add(node.name);
  for (const child of node.children) {
    dfs(visited, child);
  }
}

function isDescendantByRef(
  root?: PipelineTreeNode,
  target?: PipelineTreeNode
): boolean {
  if (root === undefined || target === undefined) return false;
  for (const child of root.children) {
    if (child === target) return true;
    if (isDescendantByRef(child, target)) return true;
  }
  return false;
}

function findUnreachable(
  treeByName: Map<string, PipelineTreeNode>,
  entrypoints: PipelineTreeNode[]
) {
  const unreachableNodes: PipelineTreeNode[] = [];
  const visited = new Set<string>();
  for (const entrypoint of entrypoints) {
    dfs(visited, entrypoint);
  }

  for (const [name, node] of treeByName.entries()) {
    if (!visited.has(name)) {
      unreachableNodes.push(node);
    }
  }

  return unreachableNodes;
}

function schemaGetNode(node: `${string}::${string}`) {
  return pipelineSchema.additionalProperties.anyOf.find(
    (item) => item.properties.node.const === node
  );
}

function schemaRefType(schema: object) {
  const ref = schema as { [RefType]: string | undefined };
  assertType(ref[RefType], "string", "RefType");
  return ref[RefType];
}

function describeType(type: string) {
  if (type in typeDescriptor) {
    return typeDescriptor[type as keyof typeof typeDescriptor];
  }
  return `${type}&`;
}

export const nodes = pipelineSchema.additionalProperties.anyOf.map((item) => ({
  title: item.title,
  description: item.description,
  node: item.properties.node.const,
  inputs: Object.fromEntries(
    Object.entries(item.properties.inputs.properties).map(([key, value]) => [
      key,
      value.properties
        ? describeType(schemaRefType(value.properties.type))
        : describeType(
            schemaRefType(
              value.anyOf.find(
                (item) => item.properties.type.const === "outputOf"
              )!.properties.type
            )
          ),
    ])
  ),
  outputs: Object.fromEntries(
    Object.entries(item.properties.outputs.properties).map(([key, value]) => [
      key,
      describeType(schemaRefType(value)),
    ])
  ),
}));

export class PipelineCompiler extends PipelineProvider {
  compile(pipeline: PipelineSchema): PipelineCompileResult {
    const errors: PipelineCompileError[] = [];
    const afterParseChecks: AfterParseCheck[] = [];
    const basePipeline: Record<string, GenericNode> = {};

    if (typeof pipeline !== "object" || pipeline === null) {
      errors.push({
        type: "pipeline-not-object",
        message: "The pipeline is not an object",
      });
      return { errors };
    }
    const entries = Object.entries(pipeline);

    for (const [nodeName, selfRef] of entries) {
      if (typeof selfRef !== "object" || selfRef === null) {
        errors.push({
          type: "node-not-object",
          message: "The node is not an object",
          nodeName,
        });
        continue;
      }

      let validProperties = true;
      for (const propertyName of propertiesToCheck) {
        if (!(propertyName in selfRef)) {
          errors.push({
            type: "node-missing-property",
            message: "The node is missing a property",
            nodeName,
            propertyName,
          });
          validProperties = false;
          continue;
        }
        const propertyValue = selfRef[propertyName] as unknown;
        if (propertyName === "dependsOn") {
          if (
            typeof propertyValue !== "string" &&
            !(
              Array.isArray(propertyValue) &&
              propertyValue
                .map((item) => typeof item === "string")
                .every(Boolean)
            )
          ) {
            errors.push({
              type: "node-invalid-property-type",
              message: "The node has an invalid property type",
              nodeName,
              propertyName,
              expectedType: "string | string[]",
              actualType: typeof propertyValue,
            });
            validProperties = false;
            continue;
          }

          afterParseChecks.push({
            type: "depends-on",
            nodeName,
            dependsOn: propertyValue,
          });
        } else {
          const expectedType = propertyTypes[propertyName];
          if (typeof propertyValue !== expectedType) {
            errors.push({
              type: "node-invalid-property-type",
              message: "The node has an invalid property type",
              nodeName,
              propertyName,
              expectedType,
              actualType: typeof propertyValue,
            });
            validProperties = false;
            continue;
          }

          if (propertyName === "node") {
            const nodeParts = (propertyValue as string).split("::");
            if (nodeParts.length !== 2) {
              errors.push({
                type: "node-invalid-property-value",
                message: "The node has an invalid property value",
                nodeName,
                propertyName,
                expectedFormat: "string::string",
                actualValue: propertyValue,
              });
              validProperties = false;
              continue;
            }

            afterParseChecks.push({
              type: "node",
              nodeName,
              node: propertyValue as `${string}::${string}`,
            });
          }

          if (propertyName === "inputs") {
            const inputEntries = Object.entries(
              propertyValue as Record<string, unknown>
            );
            for (const [inputName, inputValue] of inputEntries) {
              if (
                typeof inputValue !== "object" ||
                inputValue === null ||
                !("type" in inputValue)
              ) {
                errors.push({
                  type: "node-invalid-property-type",
                  message: "The node has an invalid property type",
                  nodeName,
                  propertyName: `${propertyName}.${inputName}`,
                  expectedType: "object",
                  actualType: typeof inputValue,
                });
                validProperties = false;
                continue;
              }
              const inputNode = inputValue as InputNode;
              const inputType = inputNode.type;
              if (inputType === "outputOf") {
                if (
                  typeof inputNode.nodeName !== "string" ||
                  typeof inputNode.outputName !== "string"
                ) {
                  errors.push({
                    type: "node-invalid-property-type",
                    message: "The node has an invalid property type",
                    nodeName,
                    propertyName: `${propertyName}.${inputName}`,
                    expectedType: "object",
                    actualType: typeof inputValue,
                  });
                  validProperties = false;
                  continue;
                }

                const selfObj = selfRef as {
                  node: `${string}::${string}` | undefined;
                };

                if (selfObj.node) {
                  afterParseChecks.push({
                    type: "input-ref",
                    nodeName,
                    input: {
                      self: {
                        name: inputName,
                        node: selfObj.node,
                      },
                      ref: {
                        nodeName: inputNode.nodeName,
                        outputName: inputNode.outputName,
                      },
                    },
                  });
                }
              } else if (inputType === "constant") {
                const obj = selfRef as {
                  node: `${string}::${string}` | undefined;
                };

                if (obj.node) {
                  afterParseChecks.push({
                    type: "input-const",
                    nodeName,
                    input: {
                      name: inputName,
                      node: obj.node,
                      value: inputNode.value,
                    },
                  });
                }
              } else {
                errors.push({
                  type: "node-invalid-property-value",
                  message: "The node has an invalid property value",
                  nodeName,
                  propertyName: `${propertyName}.${inputName}`,
                  expectedFormat: "outputOf | constant",
                  actualValue: inputType,
                });
                validProperties = false;
                continue;
              }
            }
          }

          if (propertyName === "outputs") {
            const outputEntries = Object.entries(
              propertyValue as Record<string, unknown>
            );
            for (const [outputName, outputValue] of outputEntries) {
              if (typeof outputValue !== "string") {
                errors.push({
                  type: "node-invalid-property-type",
                  message: "The node has an invalid property type",
                  nodeName,
                  propertyName: `${propertyName}.${outputName}`,
                  expectedType: "string",
                  actualType: typeof outputValue,
                });
                validProperties = false;
                continue;
              }

              const obj = selfRef as {
                node: `${string}::${string}` | undefined;
              };

              if (obj.node) {
                afterParseChecks.push({
                  type: "output-name",
                  nodeName,
                  output: {
                    node: obj.node,
                    name: outputName,
                  },
                });
              }
            }
          }
        }
      }

      if (!validProperties) {
        continue;
      }

      basePipeline[nodeName] = selfRef as GenericNode;
    }

    const treeByName = new Map<string, PipelineTreeNode>();
    const entrypoints: PipelineTreeNode[] = [];

    for (const [nodeName, node] of Object.entries(basePipeline)) {
      const treeNode: PipelineTreeNode = {
        name: nodeName,
        dependsOn:
          typeof node.dependsOn === "string"
            ? [node.dependsOn]
            : node.dependsOn,
        node: node.node,
        inputs: node.inputs,
        outputs: node.outputs,
        children: [],
      };
      treeByName.set(nodeName, treeNode);

      if (Array.isArray(node.dependsOn) && node.dependsOn.length === 0) {
        entrypoints.push(treeNode);
      }
    }

    for (const treeNode of treeByName.values()) {
      const { dependsOn } = treeNode;
      if (Array.isArray(dependsOn)) {
        for (const dependency of dependsOn) {
          const dependencyNode = treeByName.get(dependency);
          if (dependencyNode) {
            dependencyNode.children.push(treeNode);
          }
        }
      } else {
        const dependencyNode = treeByName.get(dependsOn);
        if (dependencyNode) {
          dependencyNode.children.push(treeNode);
        }
      }
    }

    if (entrypoints.length === 0) {
      errors.push({
        type: "no-entrypoints",
        message:
          "The pipeline has no entrypoints - make sure there is at least a single node with zero dependencies",
      });
    }

    for (const unreachable of findUnreachable(treeByName, entrypoints)) {
      errors.push({
        type: "unreachable-node",
        nodeName: unreachable.name,
        message: "The node is not reachable from any entrypoint",
      });
    }

    for (const check of afterParseChecks) {
      switch (check.type) {
        case "depends-on":
          if (Array.isArray(check.dependsOn)) {
            for (const dependsOn of check.dependsOn) {
              if (!(dependsOn in pipeline)) {
                errors.push({
                  type: "dependency-not-found",
                  message: "The node has an invalid dependency",
                  nodeName: check.nodeName,
                  dependency: dependsOn,
                });
              } else {
                if (dependsOn === check.nodeName) {
                  errors.push({
                    type: "self-dependency",
                    message:
                      "The depends on itself - this causes an infinite loop",
                    nodeName: check.nodeName,
                  });
                }
              }
            }
          } else {
            if (!(check.dependsOn in pipeline)) {
              errors.push({
                type: "dependency-not-found",
                message: "The node has an invalid dependency",
                nodeName: check.nodeName,
                dependency: check.dependsOn,
              });
            } else {
              if (check.dependsOn === check.nodeName) {
                errors.push({
                  type: "self-dependency",
                  message:
                    "The depends on itself - this causes an infinite loop",
                  nodeName: check.nodeName,
                });
              }
            }
          }
          break;
        case "node":
          const nodeType = schemaGetNode(check.node);
          if (!nodeType) {
            errors.push({
              type: "node-type-not-found",
              message: "The node type was not found",
              nodeType: check.node,
              nodeName: check.nodeName,
            });
          }
          break;
        case "input-ref":
          const inputSelfNodeType = schemaGetNode(check.input.self.node);
          if (!inputSelfNodeType) {
            errors.push({
              type: "node-type-reference-not-found",
              nodeName: check.nodeName,
              nodeType: check.input.self.node,
              referencedIn: check.nodeName,
              message: "The node type was not found in reference",
            });
          } else {
            const inputType =
              inputSelfNodeType.properties.inputs.properties[
                check.input.self.name
              ];

            if (!inputType) {
              errors.push({
                type: "node-type-missing-input",
                nodeName: check.nodeName,
                nodeType: check.input.self.node,
                inputName: check.input.self.name,
                message: "The input is missing from the node type",
              });
            } else {
              const outputOfDef =
                inputType.properties?.type ??
                inputType.anyOf?.find(
                  (item) => item.properties.type.const === "outputOf"
                )?.properties.type;

              if (!outputOfDef) {
                errors.push({
                  type: "node-type-input-no-output-of",
                  nodeName: check.nodeName,
                  nodeType: check.input.self.node,
                  inputName: check.input.self.name,
                  message:
                    "The input cannot be represented as an output reference",
                });
              } else {
                const outputNode = basePipeline[check.input.ref.nodeName];
                if (!outputNode) {
                  errors.push({
                    type: "node-input-reference-not-found",
                    nodeName: check.nodeName,
                    referenceNodeName: check.input.ref.nodeName,
                    inputName: check.input.self.name,
                    message: "The node referenced by an input was not found",
                  });
                } else {
                  const outputNodeType = schemaGetNode(outputNode.node);

                  if (!outputNodeType) {
                    errors.push({
                      type: "output-reference-node-type-not-found",
                      nodeName: check.nodeName,
                      referenceNodeName: check.input.ref.nodeName,
                      inputName: check.input.self.name,
                      referenceNodeType: outputNode.node,
                      message:
                        "The output node type referenced by an input was not found",
                    });
                  } else {
                    const outputReference =
                      outputNode.outputs[check.input.ref.outputName];

                    if (!outputReference) {
                      errors.push({
                        type: "output-reference-not-found",
                        nodeName: check.nodeName,
                        referenceNodeName: check.input.ref.nodeName,
                        inputName: check.input.self.name,
                        referenceOutputName: check.input.ref.outputName,
                        message:
                          "The output referenced by an input was not found",
                      });
                    } else {
                      const outputType =
                        outputNodeType.properties.outputs.properties[
                          outputReference
                        ];

                      if (!outputType) {
                        errors.push({
                          type: "output-reference-type-not-found",
                          nodeName: check.nodeName,
                          referenceNodeName: check.input.ref.nodeName,
                          inputName: check.input.self.name,
                          referenceOutputName: check.input.ref.outputName,
                          referenceNodeType: outputNode.node,
                          referenceOutput: outputReference,
                          message:
                            "The output type was not found in the referenced node type",
                        });
                      } else {
                        if (
                          schemaRefType(outputType) !==
                          schemaRefType(outputOfDef)
                        ) {
                          errors.push({
                            type: "ref-input-type-mismatch",
                            nodeName: check.nodeName,
                            referenceNodeName: check.input.ref.nodeName,
                            inputName: check.input.self.name,
                            inputType: schemaRefType(outputOfDef),
                            referenceOutputName: check.input.ref.outputName,
                            referenceNodeType: outputNode.node,
                            referenceOutput: outputReference,
                            referenceOutputType: schemaRefType(outputType),
                            message:
                              "The referenced output type does not match the input type",
                          });
                        } else {
                          const inputNode = treeByName.get(check.nodeName);
                          if (!inputNode) {
                            errors.push({
                              type: "node-not-found",
                              nodeName: check.nodeName,
                              message: "The node was not found",
                            });
                          } else {
                            if (
                              !isDescendantByRef(
                                treeByName.get(check.input.ref.nodeName),
                                inputNode
                              )
                            ) {
                              errors.push({
                                type: "ref-input-not-dependant",
                                nodeName: check.nodeName,
                                referenceNodeName: check.input.ref.nodeName,
                                inputName: check.input.self.name,
                                referenceOutputName: check.input.ref.outputName,
                                message:
                                  "The referenced output's node is not a dependency to the input's node",
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          break;
        case "input-const":
          const inputConstNodeType = schemaGetNode(check.input.node);
          if (!inputConstNodeType) {
            errors.push({
              type: "node-type-reference-not-found",
              nodeName: check.nodeName,
              nodeType: check.input.node,
              referencedIn: check.nodeName,
              message: "The node type was not found in reference",
            });
          } else {
            const inputType =
              inputConstNodeType.properties.inputs.properties[check.input.name];

            if (!inputType) {
              errors.push({
                type: "node-type-missing-input",
                nodeName: check.nodeName,
                nodeType: check.input.node,
                inputName: check.input.name,
                message: "The input is missing from the node type",
              });
            } else {
              const constDef = inputType.anyOf?.find(
                (item) => item.properties.type.const === "constant"
              );
              if (!constDef) {
                errors.push({
                  type: "node-type-input-no-const",
                  nodeName: check.nodeName,
                  nodeType: check.input.node,
                  inputName: check.input.name,
                  message: "The input cannot be represented as a constant",
                });
              } else {
                assert(
                  constDef.properties.type.const === "constant" &&
                    "value" in constDef.properties,
                  "unreachable code reached"
                );

                const validateConstant = ajv.compile(constDef.properties.value);

                if (!validateConstant(check.input.value)) {
                  errors.push({
                    type: "const-input-type-mismatch",
                    nodeName: check.nodeName,
                    nodeType: check.input.node,
                    inputName: check.input.name,
                    value: check.input.value,
                    expectedSchema: constDef.properties.value,
                    message:
                      "The input type does not match the expected schema",
                  });
                }
              }
            }
          }
          break;
        case "output-name":
          const outputNodeType = schemaGetNode(check.output.node);
          if (!outputNodeType) {
            errors.push({
              type: "node-type-reference-not-found",
              nodeName: check.nodeName,
              nodeType: check.output.node,
              referencedIn: check.nodeName,
              message: "The node type was not found in reference",
            });
          } else {
            const outputType =
              outputNodeType.properties.outputs.properties[check.output.name];
            if (!outputType) {
              errors.push({
                type: "node-type-missing-output",
                nodeName: check.nodeName,
                nodeType: check.output.node,
                outputName: check.output.name,
                message: "The output is missing from the node type",
              });
            }
          }
          break;
        default:
          assert(false, `Unknown after parse check: ${JSON.stringify(check)}`);
      }
    }

    if (errors.length === 0) {
      return { errors: [], pipeline: new Pipeline(basePipeline, entrypoints) };
    } else {
      return { errors };
    }
  }
}
