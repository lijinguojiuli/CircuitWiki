import { chromium } from "playwright";
import fs from "node:fs/promises";
const dir = "docs/screenshots";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:3000");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.screenshot({ path: `${dir}/home-desktop.png`, fullPage: true });
await page.goto("http://localhost:3000/learn/nodal-analysis");
await page.screenshot({ path: `${dir}/knowledge-desktop.png`, fullPage: true });
await page.goto("http://localhost:3000/tools");
await page.locator(".recharts-line-curve").waitFor();
await page.screenshot({ path: `${dir}/tools-light.png`, fullPage: true });
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.screenshot({ path: `${dir}/tools-dark.png`, fullPage: true });
await page.goto("http://localhost:3000/learn/phasor");
await page.screenshot({ path: `${dir}/knowledge-dark.png`, fullPage: true });
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000");
await page.screenshot({ path: `${dir}/home-mobile.png`, fullPage: true });
await browser.close();
console.log("Saved six screenshots to " + dir);
