import { EvaluationPackage, inline, PackageName } from "../library";
import { assertType } from "@mojsoski/assert";
import { EvaluationNode } from "../evaluation";
import { title, description, input, output } from "../schema-base";

export default class HttpPackage extends EvaluationPackage<"http"> {
  readonly [PackageName] = "http";

  @title("HTTP Request")
  @description("Make an HTTP request with method, headers, and body")
  @input("url", "string")
  @input("method", "string")
  @input("headers", "object")
  @input("body", "any")
  @output("status", "number")
  @output("headers", "object")
  @output("body", "any")
  request: EvaluationNode = async ({ url, method, headers, body }) => {
    assertType(url, "string", "url");
    assertType(method, "string", "method");
    assertType(headers, "object", "headers");

    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: headers as Record<string, string>,
      body: ["GET", "HEAD"].includes(method.toUpperCase())
        ? undefined
        : JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const parsedBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
    };
  };

  @title("HTTP GET")
  @description("Send a GET request with custom headers")
  @input("url", "string")
  @input("headers", "object")
  @output("status", "number")
  @output("headers", "object")
  @output("body", "any")
  get: EvaluationNode = async ({ url, headers }) => {
    assertType(url, "string", "url");
    assertType(headers, "object", "headers");

    const response = await fetch(url, {
      method: "GET",
      headers: headers as Record<string, string>,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const parsedBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
    };
  };

  @title("HTTP POST")
  @description("Send a POST request with JSON body and custom headers")
  @input("url", "string")
  @input("headers", "object")
  @input("body", "any")
  @output("status", "number")
  @output("headers", "object")
  @output("body", "any")
  post: EvaluationNode = async ({ url, headers, body }) => {
    assertType(url, "string", "url");
    assertType(headers, "object", "headers");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const parsedBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
    };
  };
}
