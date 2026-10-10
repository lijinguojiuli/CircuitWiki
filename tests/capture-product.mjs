import { chromium } from "playwright";
import fs from "node:fs/promises";
const dir = "docs/screenshots";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
await page.goto("http://localhost:3000");
await page.screenshot({ path: `${dir}/product-home.png`, fullPage: true });
await page.goto("http://localhost:3000/curriculum");
await page.screenshot({ path: `${dir}/product-curriculum.png` });
await page.goto("http://localhost:3000/formulas");
await page.getByLabel("筛选公式", { exact: true }).fill("时间常数");
await page.screenshot({ path: `${dir}/product-formulas.png`, fullPage: true });
await page.goto("http://localhost:3000/learn/nodal-analysis");
await page.screenshot({ path: `${dir}/product-lesson.png` });
await page.goto("http://localhost:3000");
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.screenshot({ path: `${dir}/product-home-dark.png` });
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: `${dir}/product-home-mobile.png`,
  fullPage: true,
});
await page.goto("http://localhost:3000/formulas");
await page.getByLabel("筛选公式", { exact: true }).fill("时间常数");
await page.screenshot({
  path: `${dir}/product-formulas-mobile.png`,
  fullPage: true,
});
await browser.close();
console.log("Saved product experience screenshots.");
