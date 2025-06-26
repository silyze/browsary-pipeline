import { createLibrary } from "../library";
import { inferLibrary, RefType } from "../schema-base";

import BrowserPackage from "./BrowserPackage";
import PagePackage from "./PagePackage";
import LogicPackage from "./LogicPackage";
import DeclarePackage from "./DeclarePackage";
import LogPackage from "./LogPackage";
import TypePackage from "./TypePackage";
import AiPackage from "./AiPackage";
import ListPackage from "./ListPackage";
import StringPackage from "./StringPackage";
import ObjectPackage from "./ObjectPackage";
import JsonPackage from "./JsonPackage";
import RegexPackage from "./RegexPackage";
import MathPackage from "./MathPackage";
import DatePackage from "./DatePackage";
import EncodingPackage from "./EncodingPackage";
import HttpPackage from "./HttpPackage";
import CryptoPackage from "./CryptoPackage";
import TaskPackage from "./TaskPackage";

export type { RefType };

const standard = [
  BrowserPackage,
  PagePackage,
  AiPackage,
  DeclarePackage,
  LogicPackage,
  MathPackage,
  TypePackage,
  StringPackage,
  ListPackage,
  ObjectPackage,
  LogPackage,
  JsonPackage,
  RegexPackage,
  DatePackage,
  EncodingPackage,
  HttpPackage,
  CryptoPackage,
  TaskPackage,
];

export const StandardLibraryProvider = createLibrary(...standard);
export const standardLibrarySchema = inferLibrary(...standard);
