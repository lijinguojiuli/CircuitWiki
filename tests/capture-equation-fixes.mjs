import { chromium } from "playwright";
import fs from "node:fs/promises";
const output = "../../work/equation-generator/fixes";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.addInitScript(() =>
    localStorage.setItem("circuitwiki-theme-monochrome", "dark"),
  );
  await page.goto("http://localhost:3000/tools/equations");
  await page.getByLabel("载入电路示例").selectOption("injection");
  await page.getByRole("button", { name: /⏚ 接地/ }).click();
  const board = page.locator('section[aria-label="交互电路画板"] svg').first();
  await board.scrollIntoViewIfNeeded();
  const p = await board.evaluate((el) => {
    const p = new DOMPoint(420, 120).matrixTransform(el.getScreenCTM());
    return { x: p.x, y: p.y };
  });
  await page.mouse.click(p.x, p.y);
  await page.getByLabel("选择元件属性").selectOption("");
  await page
    .getByRole("region", { name: "交互电路画板", exact: true })
    .screenshot({
      path: output + "/sources-and-ground.png",
      style: ".header{visibility:hidden!important}",
    });
  await page.getByLabel("选择元件属性").selectOption("R1");
  for (let i = 0; i < 12; i++)
    await page.getByRole("button", { name: "旋转90°", exact: true }).click();
  for (const id of ["V1", "I1"]) {
    await page.getByLabel("选择元件属性").selectOption(id);
    await page.getByRole("button", { name: "旋转90°", exact: true }).click();
  }
  await page.getByLabel("选择元件属性").selectOption("");
  await page
    .getByRole("region", { name: "交互电路画板", exact: true })
    .screenshot({
      path: output + "/after-rotation.png",
      style: ".header{visibility:hidden!important}",
    });
  console.log("Saved repaired source/ground and repeated-rotation diagrams.");
} finally {
  await browser.close();
}
