import { createLibrary } from "../library";
import { inferLibrary, RefType } from "../schema-base";

import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";
import LogicPackage from "./LogicPackage";
import DeclarePackage from "./DeclarePackage";
import LogPackage from "./LogPackage";
import TypePackage from "./TypePackage";
import AiPackage from "./AiPackage";

export type { RefType };

const standard = [
  BrowserPackage,
  PagePackage,
  AiPackage,
  DeclarePackage,
  LogicPackage,
  TypePackage,
  LogPackage,
];

export const StandardLibraryProvider = createLibrary(...standard);
export const standardLibrarySchema = inferLibrary(...standard);
