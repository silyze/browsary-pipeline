import { EvaluationPackage, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function uuidv4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export default class CryptoPackage extends EvaluationPackage<"crypto"> {
  readonly [PackageName] = "crypto";

  @title("Generate UUID")
  @description("Create a new UUID v4")
  @output("value", "string")
  uuid: EvaluationNode = async () => {
    return { value: uuidv4() };
  };

  @title("Hash SHA-256")
  @description("Hash a string using SHA-256")
  @input("value", "string")
  @output("value", "string")
  hashSha256: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    const encoded = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", encoded);
    return { value: toHex(hash) };
  };

  @title("Hash SHA-1")
  @description("Hash a string using SHA-1")
  @input("value", "string")
  @output("value", "string")
  hashSha1: EvaluationNode = async ({ value }) => {
    assertType(value, "string", "value");
    const encoded = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-1", encoded);
    return { value: toHex(hash) };
  };

  @title("HMAC SHA-256")
  @description("Generate HMAC using SHA-256")
  @input("key", "string")
  @input("message", "string")
  @output("value", "string")
  hmacSha256: EvaluationNode = async ({ key, message }) => {
    assertType(key, "string", "key");
    assertType(message, "string", "message");

    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(key),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );

    const sig = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      enc.encode(message)
    );
    return { value: toHex(sig) };
  };

  @title("Random Hex")
  @description("Generate random bytes and return as hex")
  @input("bytes", "number")
  @output("value", "string")
  randomHex: EvaluationNode = async ({ bytes }) => {
    assertType(bytes, "number", "bytes");
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return { value: toHex(arr.buffer) };
  };
}
