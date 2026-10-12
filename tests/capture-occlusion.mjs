import { chromium } from "playwright";
import fs from "node:fs/promises";

await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const origin = process.env.CAPTURE_ORIGIN || "http://localhost:3000";
const style = ".header,.skip-link { visibility:hidden!important; }";
await page.addInitScript(() => {
  if (!localStorage.getItem("circuitwiki-theme-monochrome"))
    localStorage.setItem("circuitwiki-theme-monochrome", "light");
});
for (const [name, route, selector] of [
  [
    "series-parallel",
    "series-parallel",
    "#challenge-book-2-4-a .problem-schematic",
  ],
  ["star-delta", "star-delta", "#section-5 + .circuit"],
  ["mesh", "mesh-analysis", "#challenge-3-4 .problem-schematic"],
  ["graph", "loop-current", "#challenge-3-5 .problem-schematic"],
  [
    "three-phase-source",
    "three-phase-basics",
    "svg[aria-label='三相电源的星形与三角形连接']",
  ],
  ["response", "initial-conditions", ".response-types"],
]) {
  await page.goto(`${origin}/learn/${route}`);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() =>
    document
      .querySelectorAll("main details")
      .forEach((details) => (details.open = true)),
  );
  await page
    .locator(selector)
    .first()
    .screenshot({ path: `docs/screenshots/occlusion-${name}.png`, style });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/learn/series-parallel`);
await page.waitForLoadState("networkidle");
const diagram = page
  .locator("#challenge-book-2-4-a .problem-schematic")
  .first();
await diagram.screenshot({
  path: "docs/screenshots/occlusion-mobile-left.png",
  style,
});
await diagram
  .locator(".diagram-scroll")
  .evaluate((element) => (element.scrollLeft = element.scrollWidth));
await diagram.screenshot({
  path: "docs/screenshots/occlusion-mobile-right.png",
  style,
});
await page.evaluate(() =>
  localStorage.setItem("circuitwiki-theme-monochrome", "dark"),
);
await page.reload();
await page.waitForLoadState("networkidle");
await diagram
  .locator(".diagram-scroll")
  .evaluate((element) => (element.scrollLeft = element.scrollWidth));
await diagram.screenshot({
  path: "docs/screenshots/occlusion-mobile-dark.png",
  style,
});
await browser.close();
console.log("Captured corrected diagrams and mobile pan positions.");
