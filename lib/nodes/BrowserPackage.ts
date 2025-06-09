import { assert } from "@mojsoski/assert";
import { EvaluationPackage, PackageConfig, PackageName } from "../library";
import { Browser } from "puppeteer-core";
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
    assert(
      browser instanceof Browser,
      `The "browser" input parameter is not an instance of the Browser class`
    );
    await browser.close();
    return {};
  };

  createPage: EvaluationNode = async ({ browser }, { gc }) => {
    assert(
      browser instanceof Browser,
      `The "browser" input parameter is not an instance of the Browser class`
    );

    const page = await browser.newPage();

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
