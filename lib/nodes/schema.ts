import { RefType } from "../schema-base";

import browserPackageSchema from "./BrowserPackage.schema";
import pagePackageSchema from "./PagePackage.schema";
import logicPackageSchema from "./LogicPackage.schema";
import declarePackageSchema from "./DeclarePackage.schema";
import logPackageSchema from "./LogPackage.schema";

export type { RefType };
export const standardLibrarySchema = [
  ...declarePackageSchema,
  ...logicPackageSchema,
  ...browserPackageSchema,
  ...pagePackageSchema,
  ...logPackageSchema,
];
