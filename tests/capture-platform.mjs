import { chromium } from "playwright";
import fs from "node:fs/promises";
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
for (const [name, route] of [
  ["home", "/"],
  ["knowledge", "/knowledge"],
  ["path", "/paths/foundations"],
  ["graph", "/graph#nodal-analysis"],
  ["search", "/search?q=时间常数"],
  ["lesson", "/learn/nodal-analysis"],
]) {
  await page.goto("http://localhost:3000" + route);
  if (route.includes("graph"))
    await page
      .getByRole("heading", { name: "节点电压法", exact: true })
      .waitFor();
  if (route.includes("search"))
    await page.getByLabel("内容类型", { exact: true }).selectOption("公式");
  await page.screenshot({ path: `docs/screenshots/platform-${name}.png` });
}
await page.getByRole("button", { name: "收藏本页", exact: true }).click();
await page.goto("http://localhost:3000/me");
await page.screenshot({
  path: "docs/screenshots/platform-me.png",
  fullPage: true,
});
await page.goto("http://localhost:3000/graph#thevenin");
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.screenshot({ path: "docs/screenshots/platform-graph-dark.png" });
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
for (const [name, route] of [
  ["home", "/"],
  ["graph", "/graph#nodal-analysis"],
  ["me", "/me"],
]) {
  await page.goto("http://localhost:3000" + route);
  await page.screenshot({
    path: `docs/screenshots/platform-${name}-mobile.png`,
    fullPage: name !== "home",
  });
}
await browser.close();
console.log("Saved platform acceptance screenshots.");
