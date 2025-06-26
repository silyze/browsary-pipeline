import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { description, input, output, title } from "../schema-base";

export default class StringPackage extends EvaluationPackage<"string"> {
  readonly [PackageName] = "string";

  @title("Create string")
  @description("Create a string value from input")
  @input("value", "any")
  @output("value", "string")
  @inline("{ value: String($value) }")
  create: EvaluationNode = async ({ value }) => {
    return { value: String(value) };
  };

  @title("Concatenate")
  @description("Concatenate two strings")
  @input("a", "string")
  @input("b", "string")
  @output("value", "string")
  @inline("{ value: $a + $b }")
  concat: EvaluationNode = async ({ a, b }) => {
    assertType(a, "string", "a");
    assertType(b, "string", "b");
    return { value: a + b };
  };

  @title("To upper case")
  @description("Convert string to uppercase")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: ($value).toUpperCase() }")
  toUpperCase: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.toUpperCase() };
  };

  @title("To lower case")
  @description("Convert string to lowercase")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: ($value).toLowerCase() }")
  toLowerCase: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.toLowerCase() };
  };

  @title("Trim")
  @description("Trim whitespace from both ends")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: ($value).trim() }")
  trim: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.trim() };
  };

  @title("Substring")
  @description("Extract substring from index to end (or toIndex)")
  @input("value", "string")
  @input("from", "number")
  @input("to", "number")
  @output("value", "string")
  @inline("{ value: ($value).substring($from, $to) }")
  substring: EvaluationNode = async ({ value, from, to }) => {
    assertType(value, "string", "value");
    assertType(from, "number", "from");
    assertType(to, "number", "to");
    return { value: value.substring(from, to) };
  };

  @title("Includes")
  @description("Check if the string includes a substring")
  @input("value", "string")
  @input("search", "string")
  @output("value", "boolean")
  @inline("{ value: ($value).includes($search) }")
  includes: EvaluationNode = async ({ value, search }) => {
    assertType(value, "string", "value");
    assertType(search, "string", "search");
    return { value: value.includes(search) };
  };

  @title("Replace all")
  @description("Replace all occurrences of a substring")
  @input("value", "string")
  @input("search", "string")
  @input("replacement", "string")
  @output("value", "string")
  @inline("{ value: ($value).replaceAll($search, $replacement) }")
  replaceAll: EvaluationNode = async ({ value, search, replacement }) => {
    assertType(value, "string", "value");
    assertType(search, "string", "search");
    assertType(replacement, "string", "replacement");
    return { value: value.replaceAll(search, replacement) };
  };

  @title("Replace")
  @description("Replace first occurrence of a substring")
  @input("value", "string")
  @input("search", "string")
  @input("replacement", "string")
  @output("value", "string")
  @inline("{ value: ($value).replace($search, $replacement) }")
  replace: EvaluationNode = async ({ value, search, replacement }) => {
    assertType(value, "string", "value");
    assertType(search, "string", "search");
    assertType(replacement, "string", "replacement");
    return { value: value.replace(search, replacement) };
  };

  @title("Split")
  @description("Split a string into a list by separator")
  @input("value", "string")
  @input("separator", "string")
  @output("value", "list")
  @inline("{ value: ($value).split($separator) }")
  split: EvaluationNode = async ({ value, separator }) => {
    assertType(value, "string", "value");
    assertType(separator, "string", "separator");
    return { value: value.split(separator) };
  };

  @title("Starts with")
  @description("Check if the string starts with a prefix")
  @input("value", "string")
  @input("prefix", "string")
  @output("value", "boolean")
  @inline("{ value: ($value).startsWith($prefix) }")
  startsWith: EvaluationNode = async ({ value, prefix }) => {
    assertType(value, "string", "value");
    assertType(prefix, "string", "prefix");
    return { value: value.startsWith(prefix) };
  };

  @title("Ends with")
  @description("Check if the string ends with a suffix")
  @input("value", "string")
  @input("suffix", "string")
  @output("value", "boolean")
  @inline("{ value: ($value).endsWith($suffix) }")
  endsWith: EvaluationNode = async ({ value, suffix }) => {
    assertType(value, "string", "value");
    assertType(suffix, "string", "suffix");
    return { value: value.endsWith(suffix) };
  };

  @title("String length")
  @description("Get the length of the string")
  @input("value", "string")
  @output("value", "number")
  @inline("{ value: ($value).length }")
  length: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.length };
  };
}
