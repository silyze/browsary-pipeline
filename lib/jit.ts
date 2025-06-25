import {
  EvaluationLibrary,
  EvaluationRuntime,
  PipelineTreeNode,
} from "./evaluation";
import { getInlineTemplate } from "./library";

export interface CompileUnit {
  injectInto: (runtime: EvaluationRuntime) => void;
  source: string;
}

export class PipelineTreeJIT {
  #chunks: string[] = [];
  #entrypoint: PipelineTreeNode;
  #library: EvaluationLibrary;

  constructor(entrypoint: PipelineTreeNode, library: EvaluationLibrary) {
    this.#entrypoint = entrypoint;
    this.#library = library;
  }

  #collectAll(node: PipelineTreeNode, seen: Set<PipelineTreeNode>) {
    if (seen.has(node)) return;
    seen.add(node);
    for (const child of node.children) {
      this.#collectAll(child, seen);
    }
  }

  compile(): CompileUnit {
    this.#chunks = [];

    const seen = new Set<PipelineTreeNode>();
    this.#collectAll(this.#entrypoint, seen);
    for (const node of seen) {
      this.#emit(node);
    }

    const source =
      '"use strict"; return function(runtime) { ' +
      this.#chunks.join("") +
      " }";

    const code = new Function(source)();

    return {
      injectInto: (runtime: EvaluationRuntime) => code(runtime),
      source,
    };
  }

  #emit(node: PipelineTreeNode) {
    this.#emitFunctionStart(node);
    this.#emitDependencies(node);
    this.#emitExecutionAndOutput(node);
    this.#emitChildCalls(node);
    this.#emitFunctionEnd(node);
  }

  #emitFunctionStart(node: PipelineTreeNode) {
    this.#chunks.push(
      "runtime.functions[",
      JSON.stringify(node.name),
      "] = async function* (c) {",
      "try {"
    );
  }

  #emitDependencies(node: PipelineTreeNode) {
    for (const dependency of node.dependsOn) {
      if (typeof dependency !== "string") {
        const depNode = JSON.stringify(dependency.nodeName);
        const depOutput = JSON.stringify(dependency.outputName);
        this.#chunks.push(
          `yield* runtime.functions[${depNode}].call(runtime, true);`,
          `if (runtime.outputs[${depNode}][${depOutput}] !== true) return;`
        );
      }
    }
  }

  #emitExecutionAndOutput(node: PipelineTreeNode) {
    const nodeKey = JSON.stringify(node.node);
    const nodeName = JSON.stringify(node.name);

    const libraryNode = this.#library[node.node];
    const inlineTemplate = getInlineTemplate(
      libraryNode.package,
      libraryNode.name
    );

    const hasOutputs = Object.keys(node.outputs).length > 0;

    this.#chunks.push(`runtime.state[${nodeName}] = "pending";`);
    this.#chunks.push(
      `yield { node: ${nodeName}, event: ${JSON.stringify("start")} };`
    );

    if (inlineTemplate) {
      const transformed = inlineTemplate.replace(
        /\$([a-zA-Z_]\w*)/g,
        (_, name) => {
          const input = node.inputs[name];
          if (!input) return "undefined";
          if (input.type === "constant") return JSON.stringify(input.value);
          return `runtime.outputs[${JSON.stringify(
            input.nodeName
          )}][${JSON.stringify(input.outputName)}]`;
        }
      );

      this.#chunks.push(`const libraryOutput = ${transformed};`);

      for (const [key, value] of Object.entries(node.outputs)) {
        const outExpr = `libraryOutput[${JSON.stringify(key)}]`;
        if (typeof value === "string") {
          this.#chunks.push(
            `runtime.outputs[${nodeName}] ??= {};`,
            `runtime.outputs[${nodeName}][${JSON.stringify(
              value
            )}] = ${outExpr};`
          );
        } else {
          this.#chunks.push(
            `runtime.outputs[${JSON.stringify(value.nodeName)}] ??= {};`,
            `runtime.outputs[${JSON.stringify(
              value.nodeName
            )}][${JSON.stringify(value.outputName)}] = ${outExpr};`
          );
        }
      }
    } else {
      this.#chunks.push("const inputs = {};");
      for (const [inputName, inputValue] of Object.entries(node.inputs)) {
        const target = `inputs[${JSON.stringify(inputName)}] = `;
        if (inputValue.type === "constant") {
          this.#chunks.push(`${target}${JSON.stringify(inputValue.value)};`);
        } else {
          this.#chunks.push(
            `${target}runtime.outputs[${JSON.stringify(
              inputValue.nodeName
            )}][${JSON.stringify(inputValue.outputName)}];`
          );
        }
      }

      if (hasOutputs) {
        this.#chunks.push(
          `const libraryOutput = await runtime.library[${nodeKey}](inputs);`
        );
        this.#chunks.push(`runtime.outputs[${nodeName}] = {};`);
        for (const [key, value] of Object.entries(node.outputs)) {
          const resultKey = JSON.stringify(key);
          if (typeof value === "string") {
            this.#chunks.push(
              `runtime.outputs[${nodeName}][${JSON.stringify(
                value
              )}] = libraryOutput[${resultKey}];`
            );
          } else {
            this.#chunks.push(
              `runtime.outputs[${JSON.stringify(
                value.nodeName
              )}][${JSON.stringify(
                value.outputName
              )}] = libraryOutput[${resultKey}];`
            );
          }
        }
      } else {
        this.#chunks.push(`await runtime.library[${nodeKey}](inputs);`);
      }
    }

    this.#chunks.push(`runtime.state[${nodeName}] = "complete";`);
    this.#chunks.push(
      `yield { node: ${nodeName}, event: ${JSON.stringify("function-end")} };`
    );
  }

  #emitChildCalls(node: PipelineTreeNode) {
    for (const child of node.children) {
      const parentName = JSON.stringify(node.name);
      const childName = JSON.stringify(child.name);
      this.#chunks.push(
        `if (!c) {`,
        `  yield { node: ${parentName}, event: "child-start", child: ${childName} };`,
        `  yield* runtime.functions[${childName}].call(runtime);`,
        `  yield { node: ${parentName}, event: "child-end", child: ${childName} };`,
        `}`
      );
    }
  }
  #emitFunctionEnd(node: PipelineTreeNode) {
    this.#chunks.push(
      `yield { node: ${JSON.stringify(node.name)}, event: ${JSON.stringify(
        "end"
      )} };`
    );
    this.#chunks.push(
      `} catch (e) {`,
      `  runtime.state[${JSON.stringify(node.name)}] = "error";`,
      `  runtime.error = e;`,
      `  yield { node: ${JSON.stringify(
        node.name
      )}, event: "error", error: e };`,
      ` throw e;`,
      `}`,
      "};"
    );
  }
}
