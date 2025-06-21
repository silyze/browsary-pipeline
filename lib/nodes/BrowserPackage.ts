import { assert } from "@mojsoski/assert";
import { EvaluationPackage, PackageConfig, PackageName } from "../library";
import type { Browser } from "puppeteer-core";
import { EvaluationNode } from "../evaluation";

export default class BrowserPackage extends EvaluationPackage<"browser"> {
  readonly [PackageName] = "browser";

  create: EvaluationNode = async ({}, { gc }) => {
    const browser = await this[PackageConfig].browserProvider.getBrowser();

    gc.registerFinalizer(() => {
      if (browser.connected) {
        return this[PackageConfig].browserProvider.releaseBrowser(browser);
      }
    });

    return {
      browser,
    };
  };

  close: EvaluationNode = async ({ browser }) => {
    assert(browser, `The "browser" input parameter is null or undefined`);
    await (browser as Browser).close();
    return {};
  };

  createPage: EvaluationNode = async ({ browser }, { gc }) => {
    assert(browser, `The "browser" input parameter is null or undefined`);

    const page = await (browser as Browser).newPage();

    const viewport = this[PackageConfig].viewport;
    if (viewport) {
      await page.setViewport(viewport);
    }

    gc.registerFinalizer(() => {
      if (!page.isClosed()) {
        return page.close();
      }
    });

    return { page };
  };
}
