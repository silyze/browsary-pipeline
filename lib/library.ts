import { EvaluationLibraryProvider, EvaluationNode } from "./evaluation";
import { EvaluationConfig } from "./evaluation";

export const PackageName = Symbol("PackageName");
export const PackageConfig = Symbol("PackageConfig");

export function inline<T extends EvaluationPackage<string>>(
  template: string
): (target: T, propertyKey: string) => void {
  return (target, propertyKey) => {
    (target as any)["__inline::" + propertyKey] = template;
  };
}
export function getInlineTemplate<T extends EvaluationPackage<string>>(
  target: T,
  propertyKey: string
): string | undefined {
  return (target as any)["__inline::" + propertyKey];
}

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

function wrapFunction(
  pkg: EvaluationPackage<string>,
  fn: EvaluationNode
): EvaluationNode & { package: EvaluationPackage<string> } {
  const partial: EvaluationNode &
    Partial<{ package: EvaluationPackage<string> }> = fn;

  partial.package = pkg;

  return partial as EvaluationNode & { package: EvaluationPackage<string> };
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
            [`${pkg[PackageName]}::${name}`, wrapFunction(pkg, impl!)] as [
              `${string}::${string}`,
              EvaluationNode & { package: EvaluationPackage<string> }
            ]
        );
      })
    );
}
