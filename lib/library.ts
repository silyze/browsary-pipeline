import { EvaluationLibraryProvider, EvaluationNode } from "./evaluation";
import { EvaluationConfig } from "./evaluation";

export const PackageName = Symbol("PackageName");
export const PackageConfig = Symbol("PackageConfig");

export interface IEvaluationPackage {
  [key: string]: EvaluationNode | undefined;
  get [PackageName](): string;
  get [PackageConfig](): EvaluationConfig;
}

export abstract class EvaluationPackage<T extends string>
  implements IEvaluationPackage
{
  #config: EvaluationConfig;

  public constructor(config: EvaluationConfig) {
    this.#config = config;
  }

  get [PackageConfig](): EvaluationConfig {
    return this.#config;
  }

  abstract get [PackageName](): T;
  [key: string]: EvaluationNode | undefined;
}

export function createLibrary(
  ...packageConstructors: (new (
    config: EvaluationConfig
  ) => EvaluationPackage<string>)[]
): EvaluationLibraryProvider {
  return (config) =>
    Object.fromEntries(
      packageConstructors.flatMap((packageConstructor) => {
        const pkg = new packageConstructor(config);

        return Object.entries(pkg).map(
          ([name, impl]) =>
            [`${pkg[PackageName]}::${name}`, impl] as [
              `${string}::${string}`,
              EvaluationNode
            ]
        );
      })
    );
}
