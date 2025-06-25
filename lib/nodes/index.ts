import { createLibrary } from "../library";
import { inferLibrary, RefType } from "../schema-base";

import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";
import LogicPackage from "./LogicPackage";
import DeclarePackage from "./DeclarePackage";
import LogPackage from "./LogPackage";

export type { RefType };

const standard = [
  BrowserPackage,
  PagePackage,
  LogicPackage,
  DeclarePackage,
  LogPackage,
];

export const StandardLibraryProvider = createLibrary(...standard);
export const standardLibrarySchema = inferLibrary(...standard);
