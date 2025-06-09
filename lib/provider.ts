import type { Pipeline } from "./evaluation";
import type { PipelineSchema } from "./schema";

export type PipelineCompileError =
  | {
      type: "pipeline-not-object";
      message: "The pipeline is not an object";
    }
  | {
      type: "node-not-object";
      message: "The node is not an object";
      nodeName: string;
    }
  | {
      type: "node-missing-property";
      message: "The node is missing a property";
      nodeName: string;
      propertyName: string;
    }
  | {
      type: "node-invalid-property-type";
      message: "The node has an invalid property type";
      nodeName: string;
      propertyName: string;
      expectedType: string;
      actualType: string;
    }
  | {
      type: "node-invalid-property-value";
      message: "The node has an invalid property value";
      nodeName: string;
      propertyName: string;
      expectedFormat: string;
      actualValue: unknown;
    }
  | {
      type: "dependency-not-found";
      message: "The node has an invalid dependency";
      nodeName: string;
      dependency: string;
    }
  | {
      type: "self-dependency";
      message: "The depends on itself - this causes an infinite loop";
      nodeName: string;
    }
  | {
      type: "no-entrypoints";
      message: "The pipeline has no entrypoints - make sure there is at least a single node with zero dependencies";
    }
  | {
      type: "node-type-not-found";
      nodeType: `${string}::${string}`;
      nodeName: string;
      message: `The node type was not found`;
    }
  | {
      type: "node-not-found";
      nodeName: string;
      message: `The node was not found`;
    }
  | {
      type: "node-type-reference-not-found";
      nodeType: `${string}::${string}`;
      nodeName: string;
      referencedIn: string;
      message: "The node type was not found in reference";
    }
  | {
      type: "node-type-missing-output";
      nodeType: `${string}::${string}`;
      nodeName: string;
      outputName: string;
      message: "The output is missing from the node type";
    }
  | {
      type: "node-type-missing-input";
      nodeType: `${string}::${string}`;
      nodeName: string;
      inputName: string;
      message: "The input is missing from the node type";
    }
  | {
      type: "node-type-input-no-const";
      nodeType: `${string}::${string}`;
      nodeName: string;
      inputName: string;
      message: "The input cannot be represented as a constant";
    }
  | {
      type: "const-input-type-mismatch";
      nodeType: `${string}::${string}`;
      nodeName: string;
      inputName: string;
      value: unknown;
      expectedSchema: unknown;
      message: "The input type does not match the expected schema";
    }
  | {
      type: "node-type-input-no-output-of";
      nodeType: `${string}::${string}`;
      nodeName: string;
      inputName: string;
      message: "The input cannot be represented as an output reference";
    }
  | {
      type: "node-input-reference-not-found";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      message: "The node referenced by an input was not found";
    }
  | {
      type: "output-reference-not-found";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      referenceOutputName: string;
      message: "The output referenced by an input was not found";
    }
  | {
      type: "output-reference-node-type-not-found";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      referenceNodeType: string;
      message: "The output node type referenced by an input was not found";
    }
  | {
      type: "output-reference-type-not-found";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      referenceNodeType: string;
      referenceOutputName: string;
      referenceOutput: string;
      message: "The output type was not found in the referenced node type";
    }
  | {
      type: "ref-input-type-mismatch";
      nodeName: string;
      inputName: string;
      inputType: string;
      referenceNodeName: string;
      referenceNodeType: string;
      referenceOutputName: string;
      referenceOutput: string;
      referenceOutputType: string;
      message: "The referenced output type does not match the input type";
    }
  | {
      type: "unreachable-node";
      nodeName: string;
      message: "The node is not reachable from any entrypoint";
    }
  | {
      type: "ref-input-not-dependant";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      referenceOutputName: string;
      message: "The referenced output's node is not a dependency to the input's node";
    };

export type PipelineCompileResult =
  | { errors: PipelineCompileError[] }
  | { errors: []; pipeline: Pipeline };

export function hasPipeline(
  reuslt: PipelineCompileResult
): reuslt is { errors: []; pipeline: Pipeline } {
  return "pipeline" in reuslt;
}

export abstract class PipelineProvider {
  abstract compile(pipeline: PipelineSchema): PipelineCompileResult;
}
