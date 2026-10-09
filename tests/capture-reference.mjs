import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const dir = "docs/screenshots";
await page.goto("http://localhost:3000/formulas");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.screenshot({ path: `${dir}/formula-reference.png` });
await page
  .locator("#formula-chapter-12")
  .screenshot({ path: `${dir}/formula-three-phase.png` });
await page.goto("http://localhost:3000/learn/three-phase-power");
await page
  .locator(".example")
  .screenshot({ path: `${dir}/three-phase-power.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/formulas");
await page.screenshot({ path: `${dir}/formula-reference-mobile.png` });
await browser.close();
console.log("Saved reference and three-phase power screenshots.");
