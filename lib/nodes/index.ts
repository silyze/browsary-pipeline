import { createLibrary } from "../library";
import { standardLibrarySchema } from "./schema";

import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";
import LogicPackage from "./LogicPackage";
import DeclarePackage from "./DeclarePackage";
import LogPackage from "./LogPackage";

export const StandardLibraryProvider = createLibrary(
  BrowserPackage,
  PagePackage,
  LogicPackage,
  DeclarePackage,
  LogPackage
);

export { standardLibrarySchema };
