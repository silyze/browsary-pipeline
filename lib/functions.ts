import type { Pipeline } from "./evaluation";

export type MaybePromise<T> = T | Promise<T>;

export type PipelineFunctionMetadata = {
  title: string;
  description?: string;
  icon?: string;
  image?: string;
};

export type PipelineFunctionParameter = {
  name: string;
  refType: string;
  description?: string;
};

export type PipelineFunctionOutput = {
  name: string;
  refType: string;
  description?: string;
  source: {
    nodeName: string;
    outputName: string;
  };
};

export type PipelineFunctionOutputType = "function" | "iterator";

export type PipelineFunctionResult =
  | {
      type: "function";
      returnValue: Promise<unknown>;
    }
  | {
      type: "iterator";
      iterator: AsyncIterable<unknown>;
    };

export type PipelineFunctionDescriptor = {
  namespace: string;
  name: string;
  metadata: PipelineFunctionMetadata;
  outputType: PipelineFunctionOutputType;
  inputs: PipelineFunctionParameter[];
  outputs: PipelineFunctionOutput[];
};

export interface PipelineFunction extends PipelineFunctionDescriptor {
  pipeline: Pipeline;
}

export interface PipelineFunctionProvider {
  listNamespaces(): MaybePromise<string[]>;
  listFunctions(namespace: string): MaybePromise<PipelineFunctionDescriptor[]>;
  getFunction(
    namespace: string,
    name: string
  ): MaybePromise<PipelineFunction | undefined>;
}
