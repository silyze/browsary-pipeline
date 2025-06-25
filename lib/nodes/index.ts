import { createLibrary } from "../library";
import { inferLibrary, RefType } from "../schema-base";

import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";
import LogicPackage from "./LogicPackage";
import DeclarePackage from "./DeclarePackage";
import LogPackage from "./LogPackage";
import TypePackage from "./TypePackage";

export type { RefType };

const standard = [
  DeclarePackage,
  LogicPackage,
  TypePackage,
  BrowserPackage,
  PagePackage,
  LogPackage,
];

export const StandardLibraryProvider = createLibrary(...standard);
export const standardLibrarySchema = inferLibrary(...standard);
