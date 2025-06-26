import { EvaluationPackage, inline, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { title, description, output, input } from "../schema-base";
import { assert, assertType } from "@mojsoski/assert";

export default class ListPackage extends EvaluationPackage<"list"> {
  readonly [PackageName] = "list";

  @title("Create list")
  @description("Create an empty list")
  @output("value", "list")
  @inline("{ value: [] }")
  create: EvaluationNode = async ({}) => {
    return { value: [] };
  };

  @title("Add item")
  @description("Add an item to a list")
  @input("list", "list")
  @input("item", "any")
  @inline("($list).push($item)")
  add: EvaluationNode = async ({ list, item }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    list.push(item);
    return {};
  };

  @title("Join items")
  @description("Join all items into a string")
  @input("list", "list")
  @input("separator", "string")
  @output("value", "string")
  @inline("{ value: ($list).join($separator) }")
  join: EvaluationNode = async ({ list, separator }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    assertType(separator, "string", "separator");
    return { value: list.join(separator) };
  };

  @title("Get item at index")
  @description("Retrieve an item by its index")
  @input("list", "list")
  @input("index", "number")
  @output("value", "any")
  @inline("{ value: ($list)[$index] }")
  get: EvaluationNode = async ({ list, index }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    assertType(index, "number", "index");
    return { value: list[index] };
  };

  @title("Set item at index")
  @description("Set the value at a specific index")
  @input("list", "list")
  @input("index", "number")
  @input("value", "any")
  @inline("($list)[$index] = $value")
  set: EvaluationNode = async ({ list, index, value }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    assertType(index, "number", "index");
    list[index] = value;
    return {};
  };

  @title("Remove item at index")
  @description("Remove and return the item at the given index")
  @input("list", "list")
  @input("index", "number")
  @output("value", "any")
  remove: EvaluationNode = async ({ list, index }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    assertType(index, "number", "index");
    const removed = list.splice(index, 1);
    return { value: removed[0] };
  };

  @title("Length of list")
  @description("Get the number of elements in the list")
  @input("list", "list")
  @output("value", "number")
  @inline("{ value: ($list).length }")
  length: EvaluationNode = async ({ list }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    return { value: list.length };
  };

  @title("Slice list")
  @description("Return a portion of the list")
  @input("list", "list")
  @input("start", "number")
  @input("end", "number")
  @output("value", "list")
  @inline("{ value: ($list).slice($start, $end) }")
  slice: EvaluationNode = async ({ list, start, end }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    assertType(start, "number", "start");
    assertType(end, "number", "end");
    return { value: list.slice(start, end) };
  };

  @title("Concat lists")
  @description("Concatenate two lists")
  @input("a", "list")
  @input("b", "list")
  @output("value", "list")
  @inline("{ value: ($a).concat($b) }")
  concat: EvaluationNode = async ({ a, b }) => {
    assert(Array.isArray(a), "First input is not a valid list");
    assert(Array.isArray(b), "Second input is not a valid list");
    return { value: a.concat(b) };
  };

  @title("Reverse list")
  @description("Reverse the order of elements in the list")
  @input("list", "list")
  @output("value", "list")
  reverse: EvaluationNode = async ({ list }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    return { value: [...list].reverse() };
  };

  @title("Sort list")
  @description("Sort the list (ascending, default)")
  @input("list", "list")
  @output("value", "list")
  sort: EvaluationNode = async ({ list }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    return { value: [...list].sort() };
  };

  @title("Includes item")
  @description("Check if the list includes an item")
  @input("list", "list")
  @input("item", "any")
  @output("value", "boolean")
  includes: EvaluationNode = async ({ list, item }) => {
    assert(Array.isArray(list), "The list input is not a valid list");
    return { value: list.includes(item) };
  };
}
