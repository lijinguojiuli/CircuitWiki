import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
await page.goto("http://localhost:3000/learn/kcl-kvl#topology-definitions");
const lab = page.locator(".multi-loop-lab");
await lab
  .locator(".topology-diagram")
  .screenshot({ path: "docs/screenshots/topology.png" });
await lab
  .getByRole("button", { name: "左侧串联组合成一条支路", exact: true })
  .click();
await lab.getByRole("button", { name: "L₁₄：最外侧回路", exact: true }).click();
await lab.screenshot({ path: "docs/screenshots/multi-loop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await lab
  .locator(".topology-diagram")
  .screenshot({ path: "docs/screenshots/multi-loop-mobile.png" });
await browser.close();
console.log("Saved multi-loop screenshots.");
