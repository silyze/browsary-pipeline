import { createLibrary } from "../library";
import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";

export const StandardLibraryProvider = createLibrary(
  BrowserPackage,
  PagePackage
);
