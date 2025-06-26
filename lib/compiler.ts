import Ajv from "ajv";
import { assert, assertType } from "@mojsoski/assert";
import {
  pipelineSchema,
  PipelineSchema,
  RefType,
  typeDescriptor,
} from "./schema";
import {
  Dependency,
  GenericNode,
  InputNode,
  Pipeline,
  PipelineTreeNode,
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
      dependsOn: Dependency | Dependency[];
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
        kind: "outputOf";
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
    }
  | {
      type: "output-ref-type";
      nodeName: string;
      outputName: string;

      output: {
        nodeName: string;
        outputName: string;
      };
    };

function isValidDependency(
  dep: unknown
): dep is string | { nodeName: string; outputName: string } {
  return (
    typeof dep === "string" ||
    (typeof dep === "object" &&
      dep !== null &&
      typeof (dep as any).nodeName === "string" &&
      typeof (dep as any).outputName === "string")
  );
}

function isValidDependencyList(
  dep: unknown
): dep is (string | { nodeName: string; outputName: string })[] {
  return Array.isArray(dep) && dep.every(isValidDependency);
}

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

function detectUnconditionalCycle(
  node: PipelineTreeNode,
  visited = new Set<string>(),
  stack = new Set<string>()
): boolean {
  if (!visited.has(node.name)) {
    visited.add(node.name);
    stack.add(node.name);

    for (const dep of node.dependsOn) {
      if (typeof dep !== "string") continue;

      const child = node.children.find((c) => c.name === dep);
      if (child) {
        if (
          !visited.has(child.name) &&
          detectUnconditionalCycle(child, visited, stack)
        ) {
          return true;
        } else if (stack.has(child.name)) {
          return true;
        }
      }
    }
  }
  stack.delete(node.name);
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
function resolveOutputReference(
  nodeName: string,
  outputName: string,
  pipeline: Record<string, GenericNode>,
  seen = new Set<string>()
): { nodeName: string; outputName: string } | undefined {
  const key = `${nodeName}.${outputName}`;
  if (seen.has(key)) return undefined;
  seen.add(key);

  const node = pipeline[nodeName];
  if (!node) return undefined;

  const output = Object.entries(node.outputs)
    .find((item) => item[1] === outputName)
    ?.at(0);

  if (typeof output === "string") {
    return { nodeName, outputName: output };
  }

  if (
    typeof output === "object" &&
    output !== null &&
    "nodeName" in output &&
    "outputName" in output
  ) {
    return resolveOutputReference(
      output.nodeName,
      output.outputName,
      pipeline,
      seen
    );
  }

  return undefined;
}

function schemaRefType(schema: object): string {
  let ref = schema as { [RefType]?: string };
  if ("anyOf" in ref) {
    const anyOf = ref.anyOf as object[];
    ref = anyOf.find((item) => (item as any).type === "string") as any;
  }

  if (!ref || !ref[RefType]) return "any";
  return ref[RefType]!;
}

function describeType(type: string) {
  if (type === "any") return "any";

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
    Object.entries(item.properties.inputs.properties).map(([key, value]) => {
      if ("properties" in value && value.properties?.type) {
        return [key, describeType(schemaRefType(value.properties.type))];
      }

      if ("anyOf" in value) {
        const refSchema = value.anyOf.find(
          (v) =>
            v.properties?.type?.const === "outputOf" ||
            v.properties?.type?.const === "lazyOutputOf"
        );
        if (refSchema?.properties?.type) {
          return [key, describeType(schemaRefType(refSchema.properties.type))];
        }
      }

      return [key, "unknown"];
    })
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
            !isValidDependency(propertyValue) &&
            !isValidDependencyList(propertyValue)
          ) {
            errors.push({
              type: "node-invalid-property-type",
              message: "The node has an invalid property type",
              nodeName,
              propertyName,
              expectedType: "string | { nodeName, outputName } | array thereof",
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
                      kind: inputNode.type,
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
              const isString = typeof outputValue === "string";
              const isRefObject =
                typeof outputValue === "object" &&
                outputValue !== null &&
                "nodeName" in outputValue &&
                "outputName" in outputValue &&
                typeof (outputValue as any).nodeName === "string" &&
                typeof (outputValue as any).outputName === "string";

              if (!isString && !isRefObject) {
                errors.push({
                  type: "node-invalid-property-type",
                  message: "The node has an invalid property type",
                  nodeName,
                  propertyName: `${propertyName}.${outputName}`,
                  expectedType:
                    "string | { nodeName: string; outputName: string }",
                  actualType: typeof outputValue,
                });
                validProperties = false;
                continue;
              }

              const obj = selfRef as {
                node: `${string}::${string}` | undefined;
              };

              if (isRefObject) {
                afterParseChecks.push({
                  type: "output-ref-type",
                  nodeName,
                  outputName,
                  output: {
                    nodeName: outputValue.nodeName as string,
                    outputName: outputValue.outputName as string,
                  },
                });
              } else if (obj.node) {
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
      const normalizedDependsOn: Dependency[] = Array.isArray(node.dependsOn)
        ? node.dependsOn
        : node.dependsOn
        ? [node.dependsOn]
        : [];

      const treeNode: PipelineTreeNode = {
        name: nodeName,
        dependsOn: normalizedDependsOn,
        node: node.node,
        inputs: node.inputs,
        outputs: node.outputs,
        children: [],
      };

      treeByName.set(nodeName, treeNode);

      if (normalizedDependsOn.length === 0) {
        entrypoints.push(treeNode);
      }
    }

    for (const treeNode of treeByName.values()) {
      for (const dependency of treeNode.dependsOn) {
        const depName =
          typeof dependency === "string" ? dependency : dependency.nodeName;
        const dependencyNode = treeByName.get(depName);

        if (dependencyNode) {
          dependencyNode.children.push(treeNode);
        }
      }
    }

    const conditionalDepNodeNames = new Set<string>();

    for (const node of Object.values(basePipeline)) {
      const dependsOn = Array.isArray(node.dependsOn)
        ? node.dependsOn
        : node.dependsOn
        ? [node.dependsOn]
        : [];

      for (const dep of dependsOn) {
        if (typeof dep === "object") {
          conditionalDepNodeNames.add(dep.nodeName);
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
    const validateDependency = (
      nodeName: string,
      dep: string | { nodeName: string; outputName: string }
    ) => {
      const depName = typeof dep === "string" ? dep : dep.nodeName;

      if (typeof dep !== "string") {
        const targetNode = basePipeline[dep.nodeName];
        if (targetNode) {
          const output = Object.entries(targetNode.outputs)
            .find((item) => item[1] === dep.outputName)
            ?.at(0);

          if (typeof output !== "string") {
            errors.push({
              type: "conditional-dependency-invalid-output-ref",
              message:
                "Conditional dependency must refer to a direct output (string), not a computed or redirected one",
              nodeName,
              dependency: dep,
            });
            return;
          }

          const nodeSchema = schemaGetNode(targetNode.node);
          if (nodeSchema) {
            const outputSchema =
              nodeSchema.properties.outputs.properties[output];
            if (!outputSchema || schemaRefType(outputSchema) !== "boolean") {
              errors.push({
                type: "conditional-dependency-not-boolean",
                message:
                  "Conditional dependency output must be of type boolean",
                nodeName,
                dependency: dep,
              });
            }
          }
        }
      }

      if (!(depName in pipeline)) {
        errors.push({
          type: "dependency-not-found",
          message: "The node has an invalid dependency",
          nodeName,
          dependency: dep,
        });
      } else if (depName === nodeName) {
        errors.push({
          type: "self-dependency",
          message: "The depends on itself - this causes an infinite loop",
          nodeName,
        });
      }
    };
    for (const check of afterParseChecks) {
      switch (check.type) {
        case "depends-on":
          if (Array.isArray(check.dependsOn)) {
            for (const dep of check.dependsOn) {
              validateDependency(check.nodeName, dep);
            }
          } else {
            validateDependency(check.nodeName, check.dependsOn);
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
              let outputOfDef: { [RefType]: string } | undefined;

              if ("properties" in inputType && inputType.properties?.type) {
                outputOfDef = inputType.properties.type;
              } else if (
                "anyOf" in inputType &&
                Array.isArray(inputType.anyOf)
              ) {
                const ref = inputType.anyOf.find(
                  (item) =>
                    item.properties?.type?.const === "outputOf" ||
                    item.properties?.type?.const === "lazyOutputOf"
                );
                outputOfDef = ref?.properties?.type as { [RefType]: string };
              }

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
                    const resolved = resolveOutputReference(
                      check.input.ref.nodeName,
                      check.input.ref.outputName,
                      basePipeline
                    );

                    if (!resolved) {
                      errors.push({
                        type: "output-reference-resolution-failed",
                        nodeName: check.nodeName,
                        referenceNodeName: check.input.ref.nodeName,
                        inputName: check.input.self.name,
                        referenceOutputName: check.input.ref.outputName,
                        message:
                          "Could not resolve indirect output reference to a concrete output name",
                      });
                      break;
                    }

                    const outputNodeSchema = schemaGetNode(
                      basePipeline[resolved.nodeName]?.node
                    );
                    if (!outputNodeSchema) {
                      errors.push({
                        type: "output-reference-node-type-not-found",
                        nodeName: check.nodeName,
                        referenceNodeName: resolved.nodeName,
                        inputName: check.input.self.name,
                        referenceOutputName: resolved.outputName,
                        message:
                          "The node schema for the resolved output was not found",
                      });
                      break;
                    }

                    const outputType =
                      outputNodeSchema.properties.outputs.properties[
                        resolved.outputName
                      ];

                    if (!outputType) {
                      errors.push({
                        type: "output-reference-type-not-found",
                        nodeName: check.nodeName,
                        referenceNodeName: resolved.nodeName,
                        inputName: check.input.self.name,
                        referenceOutputName: resolved.outputName,
                        referenceNodeType: basePipeline[resolved.nodeName].node,
                        referenceOutput: resolved.outputName,
                        message:
                          "The output type was not found in the referenced node type",
                      });
                      break;
                    }

                    const inputType = schemaRefType(outputOfDef);
                    const outputTypeStr = schemaRefType(outputType);

                    if (
                      inputType !== "any" &&
                      outputTypeStr !== "any" &&
                      inputType !== outputTypeStr
                    ) {
                      errors.push({
                        type: "ref-input-type-mismatch",
                        nodeName: check.nodeName,
                        referenceNodeName: resolved.nodeName,
                        inputName: check.input.self.name,
                        inputType: schemaRefType(outputOfDef),
                        referenceOutputName: resolved.outputName,
                        referenceNodeType: basePipeline[resolved.nodeName].node,
                        referenceOutput: resolved.outputName,
                        referenceOutputType: schemaRefType(outputType),
                        message:
                          "The referenced output type does not match the input type",
                      });
                      break;
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
              if ("anyOf" in inputType) {
                const constDef = inputType.anyOf.find(
                  (item) =>
                    "properties" in item &&
                    item.properties?.type?.const === "constant"
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
                    constDef.properties?.type?.const === "constant" &&
                      "value" in constDef.properties,
                    "unreachable code reached"
                  );
                  const valueSchema = constDef.properties?.value;

                  if (!valueSchema || typeof valueSchema !== "object") {
                    errors.push({
                      type: "const-input-schema-invalid",
                      nodeName: check.nodeName,
                      nodeType: check.input.node,
                      inputName: check.input.name,
                      value: check.input.value,
                      message:
                        "The constant input schema is missing or invalid",
                    });
                  } else {
                    const isAnySchema = Object.keys(valueSchema).length === 0;
                    const validateConstant = isAnySchema
                      ? () => true
                      : ajv.compile(valueSchema);

                    if (!validateConstant(check.input.value)) {
                      errors.push({
                        type: "const-input-type-mismatch",
                        nodeName: check.nodeName,
                        nodeType: check.input.node,
                        inputName: check.input.name,
                        value: check.input.value,
                        expectedSchema: valueSchema,
                        message:
                          "The input type does not match the expected schema",
                      });
                    }
                  }
                }
              } else if (schemaRefType(inputType.properties) !== "any") {
                errors.push({
                  type: "node-type-input-no-const",
                  nodeName: check.nodeName,
                  nodeType: check.input.node,
                  inputName: check.input.name,
                  message: "The input cannot be represented as a constant",
                });
              }
            }
          }
          break;

        case "output-ref-type":
          const outputRefNodeSelf = treeByName.get(check.nodeName);
          const outputRefNodeTarget = treeByName.get(check.output.nodeName);

          if (!outputRefNodeSelf) {
            errors.push({
              type: "output-ref-self-node-not-found",
              nodeName: check.nodeName,
              message: "The source node of the output reference was not found",
            });
            break;
          }

          if (!outputRefNodeTarget) {
            errors.push({
              type: "output-ref-target-node-not-found",
              nodeName: check.nodeName,
              referenceNodeName: check.output.nodeName,
              message: "The target node of the output reference was not found",
            });
            break;
          }

          const outputRefNodeSelfSchema = schemaGetNode(outputRefNodeSelf.node);
          if (!outputRefNodeSelfSchema) {
            errors.push({
              type: "output-ref-self-node-type-not-found",
              nodeName: check.nodeName,
              nodeType: outputRefNodeSelf.node,
              message: "The type of the source node was not found",
            });
            break;
          }

          const outputRefNodeTargetSchema = schemaGetNode(
            outputRefNodeTarget.node
          );
          if (!outputRefNodeTargetSchema) {
            errors.push({
              type: "output-ref-target-node-type-not-found",
              nodeName: check.nodeName,
              referenceNodeName: check.output.nodeName,
              referenceNodeType: outputRefNodeTarget.node,
              message: "The type of the target node was not found",
            });
            break;
          }

          const outputRefSelfSchema =
            outputRefNodeSelfSchema.properties.outputs.properties[
              check.outputName
            ];
          if (!outputRefSelfSchema) {
            errors.push({
              type: "output-ref-self-output-not-found",
              nodeName: check.nodeName,
              outputName: check.outputName,
              nodeType: outputRefNodeSelf.node,
              message: "The source output name was not found in the node type",
            });
            break;
          }

          const outputRefTargetResolved = resolveOutputReference(
            check.output.nodeName,
            check.output.outputName,
            basePipeline
          );
          if (!outputRefTargetResolved) {
            errors.push({
              type: "output-ref-target-resolution-failed",
              nodeName: check.nodeName,
              referenceNodeName: check.output.nodeName,
              referenceOutputName: check.output.outputName,
              message: "Could not resolve the target output reference",
            });
            break;
          }

          const resolvedOutputName = outputRefTargetResolved.outputName;
          const outputRefTargetOutputSchema =
            outputRefNodeTargetSchema.properties.outputs.properties[
              resolvedOutputName
            ];

          if (!outputRefTargetOutputSchema) {
            errors.push({
              type: "output-ref-target-output-not-found",
              nodeName: check.nodeName,
              referenceNodeName: check.output.nodeName,
              referenceOutputName: resolvedOutputName,
              referenceNodeType: outputRefNodeTarget.node,
              message: "The target output name was not found in the node type",
            });
            break;
          }

          const selfType = schemaRefType(outputRefSelfSchema);
          const targetType = schemaRefType(outputRefTargetOutputSchema);
          const typesMatch =
            selfType === "any" ||
            targetType === "any" ||
            selfType === targetType;

          if (!typesMatch) {
            errors.push({
              type: "output-ref-type-mismatch",
              nodeName: check.nodeName,
              outputName: check.outputName,
              referenceNodeName: check.output.nodeName,
              referenceOutputName: resolvedOutputName,
              referenceNodeType: outputRefNodeTarget.node,
              sourceNodeType: outputRefNodeSelf.node,
              sourceOutputType: selfType,
              targetOutputType: targetType,
              message:
                "The referenced output type does not match the declared output type",
            });
          }

          break;
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
    for (const entry of entrypoints) {
      if (detectUnconditionalCycle(entry)) {
        errors.push({
          type: "unconditional-cycle",
          message:
            "Detected a circular dependency with only unconditional links. This creates an infinite loop.",
          nodeName: entry.name,
        });
        break;
      }
    }
    if (errors.length === 0) {
      return { errors: [], pipeline: new Pipeline(basePipeline, entrypoints) };
    } else {
      return { errors };
    }
  }
}
