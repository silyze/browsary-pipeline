import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

export default class RegexPackage extends EvaluationPackage<"regex"> {
  readonly [PackageName] = "regex";

  @title("Test regex")
  @description("Check if a regex matches the string")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("value", "boolean")
  test: EvaluationNode = async ({ pattern, value, flags = "" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    return { value: regex.test(value) };
  };

  @title("Match regex")
  @description("Match a regex against the string")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("value", "list")
  match: EvaluationNode = async ({ pattern, value, flags = "" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    const match = value.match(regex);
    return { value: match ?? [] };
  };

  @title("Match all")
  @description("Find all matches of a global regex")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("value", "list")
  matchAll: EvaluationNode = async ({ pattern, value, flags = "g" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(
      pattern,
      flags.includes("g") ? flags : flags + "g"
    );
    const matches = [...value.matchAll(regex)];
    return { value: matches.map((m) => Array.from(m)) };
  };

  @title("Named groups")
  @description("Extract named groups from first match")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("value", "object")
  groups: EvaluationNode = async ({ pattern, value, flags = "" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    const match = value.match(regex);
    return { value: match?.groups ?? {} };
  };

  @title("Named groups with index")
  @description("Return named groups and match index from first match")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("groups", "object")
  @output("index", "number")
  groupsWithIndex: EvaluationNode = async ({ pattern, value, flags = "" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    const match = regex.exec(value);
    if (match?.groups) {
      return {
        groups: match.groups,
        index: match.index,
      };
    }
    return {
      groups: {},
      index: -1,
    };
  };

  @title("Match all named")
  @description("Globally match and return named groups with indexes")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("groups", "list")
  @output("indexes", "list")
  matchAllNamed: EvaluationNode = async ({ pattern, value, flags = "g" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");

    const regex = new RegExp(
      pattern,
      flags.includes("g") ? flags : flags + "g"
    );
    const groupsList: Record<string, string>[] = [];
    const indexList: number[] = [];

    for (const match of value.matchAll(regex)) {
      if (match.groups) {
        groupsList.push(match.groups);
        indexList.push(match.index);
      }
    }

    return {
      groups: groupsList,
      indexes: indexList,
    };
  };

  @title("Replace")
  @description("Replace the first match of a regex")
  @input("pattern", "string")
  @input("value", "string")
  @input("replacement", "string")
  @input("flags", "string")
  @output("value", "string")
  replace: EvaluationNode = async ({
    pattern,
    value,
    replacement,
    flags = "",
  }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(replacement, "string", "replacement");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    return { value: value.replace(regex, replacement) };
  };

  @title("Replace all")
  @description("Replace all matches of a regex")
  @input("pattern", "string")
  @input("value", "string")
  @input("replacement", "string")
  @input("flags", "string")
  @output("value", "string")
  replaceAll: EvaluationNode = async ({
    pattern,
    value,
    replacement,
    flags = "g",
  }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(replacement, "string", "replacement");
    assertType(flags, "string", "flags");
    const regex = new RegExp(
      pattern,
      flags.includes("g") ? flags : flags + "g"
    );
    return { value: value.replace(regex, replacement) };
  };

  @title("Split by regex")
  @description("Split a string using a regex pattern")
  @input("pattern", "string")
  @input("value", "string")
  @input("flags", "string")
  @output("value", "list")
  split: EvaluationNode = async ({ pattern, value, flags = "" }) => {
    assertType(pattern, "string", "pattern");
    assertType(value, "string", "value");
    assertType(flags, "string", "flags");
    const regex = new RegExp(pattern, flags);
    return { value: value.split(regex) };
  };

  @title("Escape string for regex")
  @description("Escape a string to be used as a regex pattern")
  @input("value", "string")
  @output("value", "string")
  escape: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") };
  };

  @title("Unescape regex string")
  @description("Unescape a regex-escaped string (basic)")
  @input("value", "string")
  @output("value", "string")
  unescape: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: value.replace(/\\([.*+?^${}()|[\]\\])/g, "$1") };
  };
}
