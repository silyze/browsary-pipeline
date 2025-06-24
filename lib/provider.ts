import type { Dependency, Pipeline } from "./evaluation";
import type { PipelineSchema } from "./schema";

export type PipelineCompileError =
  | {
      type: "conditional-dependency-invalid-output-ref";
      message: "Conditional dependency must refer to a direct output (string), not a computed or redirected one";
      nodeName: string;
      dependency: {
        nodeName: string;
        outputName: string;
      };
    }
  | {
      type: "unconditional-cycle";
      message: "Detected a circular dependency with only unconditional links. This creates an infinite loop.";
      nodeName: string;
    }
  | {
      type: "conditional-dependency-not-boolean";
      message: "Conditional dependency output must be of type boolean";
      nodeName: string;
      dependency: Dependency;
    }
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
      dependency: Dependency;
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
      type: "const-input-schema-invalid";
      nodeType: `${string}::${string}`;
      nodeName: string;
      inputName: string;
      value: unknown;
      message: "The constant input schema is missing or invalid";
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
      type: "output-reference-indirect";
      nodeName: string;
      inputName: string;
      referenceNodeName: string;
      referenceOutputName: string;
      message: "Cannot typecheck indirect output references (output is not a direct string name)";
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
    }
  | {
      type: "output-reference-resolution-failed";
      nodeName: string;
      referenceNodeName: string;
      inputName: string;
      referenceOutputName: string;
      message: "Could not resolve indirect output reference to a concrete output name";
    }
  | {
      type: "output-reference-node-type-not-found";
      nodeName: string;
      referenceNodeName: string;
      inputName: string;
      referenceOutputName: string;
      message: "The node schema for the resolved output was not found";
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
