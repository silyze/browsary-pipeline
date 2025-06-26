import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlUnescape(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export default class EncodingPackage extends EvaluationPackage<"encoding"> {
  readonly [PackageName] = "encoding";

  @title("Base64 Encode")
  @description("Encode a string as base64")
  @input("value", "string")
  @output("value", "string")
  base64Encode: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: Buffer.from(value, "utf8").toString("base64") };
  };

  @title("Base64 Decode")
  @description("Decode a base64 string")
  @input("value", "string")
  @output("value", "string")
  base64Decode: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: Buffer.from(value, "base64").toString("utf8") };
  };

  @title("Encode URI")
  @description("Encode a full URI")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: encodeURI($value) }")
  encodeUri: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: encodeURI(value) };
  };

  @title("Decode URI")
  @description("Decode a full URI")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: decodeURI($value) }")
  decodeUri: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: decodeURI(value) };
  };

  @title("Encode URI Component")
  @description("Encode a URI component (e.g. query value)")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: encodeURIComponent($value) }")
  encodeUriComponent: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: encodeURIComponent(value) };
  };

  @title("Decode URI Component")
  @description("Decode a URI component")
  @input("value", "string")
  @output("value", "string")
  @inline("{ value: decodeURIComponent($value) }")
  decodeUriComponent: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: decodeURIComponent(value) };
  };

  @title("Escape HTML")
  @description("Escape special characters to HTML entities")
  @input("value", "string")
  @output("value", "string")
  escapeHtml: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: htmlEscape(value) };
  };

  @title("Unescape HTML")
  @description("Convert HTML entities back to characters")
  @input("value", "string")
  @output("value", "string")
  unescapeHtml: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    return { value: htmlUnescape(value) };
  };
}
