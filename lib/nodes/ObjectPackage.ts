import { EvaluationPackage, inline, PackageName } from "../library";
import { assert, assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { description, input, output, title } from "../schema-base";

export default class ObjectPackage extends EvaluationPackage<"object"> {
  readonly [PackageName] = "object";

  @title("Create object")
  @description("Create an empty object")
  @output("value", "object")
  @inline("{ value: {} }")
  create: EvaluationNode = async ({}) => ({ value: {} });

  @title("Get property")
  @description("Get a value from an object by key")
  @input("object", "object")
  @input("key", "string")
  @output("value", "any")
  @inline("{ value: ($object)[$key] }")
  get: EvaluationNode = async ({ object, key }) => {
    assertType(object, "object", "object");
    assertType(key, "string", "key");
    return { value: (object as Record<string, unknown>)[key] };
  };

  @title("Set property")
  @description("Set a property on an object")
  @input("object", "object")
  @input("key", "string")
  @input("value", "any")
  @inline("($object)[$key] = $value")
  set: EvaluationNode = async ({ object, key, value }) => {
    assertType(object, "object", "object");
    assertType(key, "string", "key");
    (object as Record<string, unknown>)[key] = value;
    return {};
  };

  @title("Delete property")
  @description("Remove a key from the object")
  @input("object", "object")
  @input("key", "string")
  @inline("delete ($object)[$key]")
  delete: EvaluationNode = async ({ object, key }) => {
    assertType(object, "object", "object");
    assertType(key, "string", "key");
    delete (object as Record<string, unknown>)[key];
    return {};
  };

  @title("Has property")
  @description("Check if a key exists in the object")
  @input("object", "object")
  @input("key", "string")
  @output("value", "boolean")
  @inline("{ value: ($key in $object) }")
  has: EvaluationNode = async ({ object, key }) => {
    assertType(object, "object", "object");
    assertType(key, "string", "key");
    return { value: key in object };
  };

  @title("Keys")
  @description("Get the list of keys in the object")
  @input("object", "object")
  @output("value", "list")
  @inline("{ value: Object.keys($object) }")
  keys: EvaluationNode = async ({ object }) => {
    assertType(object, "object", "object");
    return { value: Object.keys(object) };
  };

  @title("Values")
  @description("Get the list of values in the object")
  @input("object", "object")
  @output("value", "list")
  @inline("{ value: Object.values($object) }")
  values: EvaluationNode = async ({ object }) => {
    assertType(object, "object", "object");
    return { value: Object.values(object) };
  };

  @title("Entries")
  @description("Get the list of [key, value] entries")
  @input("object", "object")
  @output("value", "list")
  @inline("{ value: Object.entries($object) }")
  entries: EvaluationNode = async ({ object }) => {
    assertType(object, "object", "object");
    return { value: Object.entries(object) };
  };

  @title("Merge objects")
  @description("Shallow merge two objects")
  @input("a", "object")
  @input("b", "object")
  @output("value", "object")
  @inline("{ value: Object.assign({}, $a, $b) }")
  merge: EvaluationNode = async ({ a, b }) => {
    assertType(a, "object", "a");
    assertType(b, "object", "b");
    return { value: Object.assign({}, a, b) };
  };

  @title("Copy object")
  @description("Create a shallow copy of an object")
  @input("object", "object")
  @output("value", "object")
  @inline("{ value: Object.assign({}, $object) }")
  copy: EvaluationNode = async ({ object }) => {
    assertType(object, "object", "object");
    return { value: Object.assign({}, object) };
  };

  @title("Object length")
  @description("Count number of keys in the object")
  @input("object", "object")
  @output("value", "number")
  @inline("{ value: Object.keys($object).length }")
  length: EvaluationNode = async ({ object }) => {
    assertType(object, "object", "object");
    return { value: Object.keys(object).length };
  };

  @title("Pick keys")
  @description("Create a new object with selected keys")
  @input("object", "object")
  @input("keys", "list")
  @output("value", "object")
  pick: EvaluationNode = async ({ object, keys }) => {
    assertType(object, "object", "object");
    assert(Array.isArray(keys), "keys must be a list");
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key === "string" && key in object) {
        result[key] = (object as Record<string, unknown>)[key];
      }
    }
    return { value: result };
  };

  @title("Omit keys")
  @description("Create a new object without selected keys")
  @input("object", "object")
  @input("keys", "list")
  @output("value", "object")
  omit: EvaluationNode = async ({ object, keys }) => {
    assertType(object, "object", "object");
    assert(Array.isArray(keys), "keys must be a list");
    const result: Record<string, unknown> = {};
    const omitSet = new Set(keys.filter((k) => typeof k === "string"));
    for (const key in object) {
      if (!omitSet.has(key)) {
        result[key] = (object as Record<string, unknown>)[key];
      }
    }
    return { value: result };
  };

  @title("Entries to object")
  @description("Convert list of [key, value] pairs to object")
  @input("entries", "list")
  @output("value", "object")
  entriesToObject: EvaluationNode = async ({ entries }) => {
    assert(Array.isArray(entries), "entries must be a list");
    const result: Record<string, unknown> = {};
    for (const entry of entries) {
      if (
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string"
      ) {
        result[entry[0]] = entry[1];
      }
    }
    return { value: result };
  };
}
