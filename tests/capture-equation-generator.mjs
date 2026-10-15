import { chromium } from "playwright";
import fs from "node:fs/promises";
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.addInitScript(() =>
    localStorage.setItem("circuitwiki-theme-monochrome", "light"),
  );
  await page.goto("http://localhost:3000/tools/equations");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("载入电路示例").selectOption("injection");
  await page.getByLabel("分析方法").selectOption("nodal");
  await page.getByRole("button", { name: "快速答案", exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "docs/screenshots/equation-generator-nodal.png",
    fullPage: true,
  });
  await page.getByLabel("载入电路示例").selectOption("floating");
  await page.getByLabel("分析方法").selectOption("mesh");
  await page.getByLabel("选择元件属性").selectOption("I1");
  await page.getByLabel("元件参数").fill("1");
  await page.getByRole("button", { name: "应用参数", exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "docs/screenshots/equation-generator-mesh.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "学习模式", exact: true }).click();
  await page
    .getByRole("group", { name: "推导步骤" })
    .getByRole("button")
    .nth(2)
    .click();
  await page
    .locator("#equation-output")
    .screenshot({
      path: "docs/screenshots/equation-generator-teaching.png",
      style: ".header,.skip-link{visibility:hidden!important}",
    });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    colorScheme: "dark",
  });
  await mobile.addInitScript(() =>
    localStorage.setItem("circuitwiki-theme-monochrome", "dark"),
  );
  await mobile.goto("http://localhost:3000/tools/equations");
  await mobile.waitForLoadState("networkidle");
  await mobile.getByLabel("载入电路示例").selectOption("injection");
  await mobile.getByLabel("分析方法").selectOption("nodal");
  await mobile
    .getByRole("region", { name: "可缩放滚动的电路画板" })
    .evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
  await mobile
    .getByRole("region", { name: "交互电路画板" })
    .screenshot({
      path: "docs/screenshots/equation-generator-mobile.png",
      style: ".header,.skip-link{visibility:hidden!important}",
    });
  console.log(
    "Saved functional generator desktop, mesh, teaching and mobile screenshots.",
  );
} finally {
  await browser.close();
}
