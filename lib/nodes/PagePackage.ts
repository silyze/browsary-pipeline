import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assert, assertType } from "@mojsoski/assert";
import { title, description, input, output } from "../schema-base";
import type { Page } from "puppeteer-core";

export default class PagePackage extends EvaluationPackage<"page"> {
  readonly [PackageName] = "page";

  @title("Close page")
  @description("Close a tab or page")
  @input("page", "page")
  close: EvaluationNode = async ({ page }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    await (page as Page).close();
    return {};
  };

  @title("Goto URL")
  @description("Navigate to an URL")
  @input("page", "page")
  @input("url", "string")
  @input("waitUntil", "waitEventType")
  goto: EvaluationNode = async ({ page, url, waitUntil }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    assertType(url, "string", "url");
    assertType(waitUntil, "string", "waitUntil");

    assert(
      waitUntil === "load" ||
        waitUntil === "domcontentloaded" ||
        waitUntil === "networkidle0" ||
        waitUntil === "networkidle2",
      `The "waitUntil" input parameter has an invalid value`
    );

    await (page as Page).goto(url, { waitUntil });
    return {};
  };

  @title("Click element")
  @description("Click on a HTML element with a selector")
  @input("page", "page")
  @input("selector", "string")
  @input("waitForNavigation", "boolean")
  click: EvaluationNode = async ({ page, selector, waitForNavigation }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    assertType(selector, "string", "selector");
    assertType(waitForNavigation, "boolean", "waitForNavigation");

    if (waitForNavigation) {
      await Promise.all([
        (page as Page).waitForNavigation(),
        (page as Page).click(selector),
      ]);
    } else {
      await (page as Page).click(selector);
    }

    return {};
  };

  @title("Type in element")
  @description("Type in a HTML element with a selector")
  @input("page", "page")
  @input("selector", "string")
  @input("text", "string")
  @input("delayMs", "number")
  type: EvaluationNode = async ({ page, selector, text, delayMs }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    assertType(selector, "string", "selector");
    assertType(text, "string", "text");
    assertType(delayMs, "number", "delayMs");

    await (page as Page).type(selector, text, { delay: delayMs });
    return {};
  };

  @title("Get page content")
  @description("Retrieve the current HTML markup of the page")
  @input("page", "page")
  @output("content", "string")
  display: EvaluationNode = async ({ page }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    const content = await (page as Page).content();
    return { content };
  };

  @title("Evaluate expression")
  @description("Execute a JavaScript expression in the page context and return the result")
  @input("page", "page")
  @input("expression", "string")
  @output("result", "any")
  evaluate: EvaluationNode = async ({ page, expression }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    assertType(expression, "string", "expression");
    const script = expression.trim();
    assert(script.length > 0, `The "expression" input parameter cannot be empty`);

    const result = await (page as Page).evaluate(script);
    return { result };
  };

  @title("Wait for selector")
  @description("Wait until a selector appears on the page within the provided timeout")
  @input("page", "page")
  @input("selector", "string")
  @input("timeoutMs", "number")
  @output("found", "boolean")
  waitForSelector: EvaluationNode = async ({ page, selector, timeoutMs }) => {
    assert(page, `The "page" input parameter is null or undefined`);
    assertType(selector, "string", "selector");
    assert(selector.trim().length > 0, `The "selector" input parameter cannot be empty`);
    assertType(timeoutMs, "number", "timeoutMs");
    assert(timeoutMs >= 0, `The "timeoutMs" input parameter must be greater than or equal to 0`);

    try {
      const handle = await (page as Page).waitForSelector(selector, {
        timeout: timeoutMs,
      });

      if (handle) {
        await handle.dispose();
        return { found: true };
      }

      return { found: false };
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        (error as Error).name === "TimeoutError"
      ) {
        return { found: false };
      }

      throw error;
    }
  };
}
