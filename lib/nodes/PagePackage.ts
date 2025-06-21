import { EvaluationPackage, PackageName } from "../library";
import { EvaluationNode } from "../evaluation";
import { assert, assertType } from "@mojsoski/assert";
import type { Page } from "puppeteer-core";
import {
  compressNode,
  HTMLSerializer,
  HTMLTextStream,
} from "@silyze/html-prompt-utils";

export default class PagePackage extends EvaluationPackage<"page"> {
  readonly [PackageName] = "page";

  close: EvaluationNode = async ({ page }) => {
    assert(page, `The "page" input parameter is null or undefined`);

    await (page as Page).close();
    return {};
  };

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

  type: EvaluationNode = async ({ page, selector, text, delayMs }) => {
    assert(page, `The "page" input parameter is null or undefined`);

    assertType(selector, "string", "selector");
    assertType(text, "string", "text");
    assertType(delayMs, "number", "delayMs");

    await (page as Page).type(selector, text, { delay: delayMs });

    return {};
  };

  display: EvaluationNode = async ({ page, selector }, { logger }) => {
    assert(page, `The "page" input parameter is null or undefined`);

    assertType(selector, "string", "selector");

    const html = await (page as Page).$$eval(selector, (els) =>
      els.map((el) => el.outerHTML).join("")
    );

    const root = await HTMLSerializer.parse(new HTMLTextStream(html));
    const compressedNode = compressNode(root) ?? {};

    logger.log("info", "display", (page as Page).url(), compressedNode);

    return {};
  };
}
