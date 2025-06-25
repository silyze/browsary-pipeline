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

  compile(): CompileUnit {
    this.emit(this.#entrypoint, new Set());
    const source = this.#chunks.join("");
    const code = Function(source);

    return {
      injectInto: (runtime: EvaluationRuntime) => code.apply(runtime),
      source,
    };
  }

  private emit(node: PipelineTreeNode, seen: Set<PipelineTreeNode>) {
    seen.add(node);
    this.emitFunctionStart(node);
    this.emitDependencies(node);
    this.emitInputAssignment(node);
    this.emitExecutionAndOutput(node);
    this.emitChildCalls(node, seen);
    this.emitFunctionEnd(node);
  }

  private emitFunctionStart(node: PipelineTreeNode) {
    this.#chunks.push(
      "this.functions[",
      JSON.stringify(node.name),
      "] = async function* (c) {",
      "try {"
    );
  }

  private emitDependencies(node: PipelineTreeNode) {
    for (const dependency of node.dependsOn) {
      if (typeof dependency !== "string") {
        const depNode = JSON.stringify(dependency.nodeName);
        const depOutput = JSON.stringify(dependency.outputName);
        this.#chunks.push(
          `yield* this.functions[${depNode}].call(this, true);`
        );
        this.#chunks.push(
          `if (this.outputs[${depNode}][${depOutput}] !== true) return;`
        );
      }
    }
  }

  private emitInputAssignment(node: PipelineTreeNode) {
    this.#chunks.push("const inputs = {};");
    for (const [inputName, inputValue] of Object.entries(node.inputs)) {
      const target = `inputs[${JSON.stringify(inputName)}] = `;
      if (inputValue.type === "constant") {
        this.#chunks.push(`${target}${JSON.stringify(inputValue.value)};`);
      } else {
        this.#chunks.push(
          `${target}this.outputs[${JSON.stringify(
            inputValue.nodeName
          )}][${JSON.stringify(inputValue.outputName)}];`
        );
      }
    }
  }

  private emitExecutionAndOutput(node: PipelineTreeNode) {
    this.#chunks.push("yield;");

    const nodeKey = JSON.stringify(node.node);

    const libraryNode = this.#library[node.node];

    const inlineTemplate = getInlineTemplate(
      libraryNode.package,
      libraryNode.name
    );

    if (inlineTemplate) {
      const transformed = inlineTemplate.replace(
        /\$([a-zA-Z_]\w*)/g,
        (_, name) => {
          return `inputs[${JSON.stringify(name)}]`;
        }
      );

      this.#chunks.push(`const libraryOutput = ${transformed};`);
    } else {
      this.#chunks.push(
        `const libraryOutput = await this.library[${nodeKey}](inputs);`
      );
    }

    const outputTarget = JSON.stringify(node.name);
    this.#chunks.push(`this.outputs[${outputTarget}] = {};`);

    for (const [key, value] of Object.entries(node.outputs)) {
      const resultKey = JSON.stringify(key);
      if (typeof value === "string") {
        this.#chunks.push(
          `this.outputs[${outputTarget}][${JSON.stringify(
            value
          )}] = libraryOutput[${resultKey}];`
        );
      } else {
        this.#chunks.push(
          `this.outputs[${JSON.stringify(value.nodeName)}][${JSON.stringify(
            value.outputName
          )}] = libraryOutput[${resultKey}];`
        );
      }
    }

    this.#chunks.push(`this.state[${JSON.stringify(node.name)}] = "complete";`);
  }

  private emitChildCalls(node: PipelineTreeNode, seen: Set<PipelineTreeNode>) {
    for (const child of node.children) {
      if (!seen.has(child)) {
        this.emit(child, new Set(seen));
      }
      this.#chunks.push(
        `if (!c) yield* this.functions[${JSON.stringify(
          child.name
        )}].call(this);`
      );
    }
  }

  private emitFunctionEnd(node: PipelineTreeNode) {
    this.#chunks.push(
      `} catch (e) {`,
      `  this.state[${JSON.stringify(node.name)}] = "error";`,
      `  this.error = e;`,
      `  return;`,
      `}`,
      "};"
    );
  }
}
