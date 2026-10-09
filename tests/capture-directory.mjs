import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const dir = "docs/screenshots";
await page.goto("http://localhost:3000/curriculum");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.screenshot({ path: `${dir}/curriculum-chapters.png` });
await page.locator("#chapter-10").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${dir}/curriculum-later-chapters.png` });
await page.goto("http://localhost:3000/learn/capacitor");
const panel = page.locator(".left-sidebar");
await panel.evaluate((el) => {
  const target = el.querySelector('a[href="/learn/rc-circuit"]');
  el.scrollTop +=
    target.getBoundingClientRect().top - el.getBoundingClientRect().top - 140;
});
await page.screenshot({ path: `${dir}/directory-before.png` });
await panel.getByRole("link", { name: "RC 一阶电路", exact: true }).click();
await page.getByRole("heading", { level: 1, name: "RC 一阶电路" }).waitFor();
await page.screenshot({ path: `${dir}/directory-after.png` });
await page.goto("http://localhost:3000/learn/coupled-inductors");
await page
  .locator(".circuit")
  .screenshot({ path: `${dir}/coupled-inductors.png` });
await page.goto("http://localhost:3000/learn/rlc");
await page
  .locator(".circuit")
  .first()
  .screenshot({ path: `${dir}/resonance.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/learn/rc-circuit");
await page.getByRole("button", { name: "打开目录", exact: true }).click();
await page.locator(".mobile-menu").waitFor();
await page.screenshot({ path: `${dir}/directory-mobile.png` });
await page.getByRole("button", { name: "关闭目录", exact: true }).click();
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.getByRole("button", { name: "打开目录", exact: true }).click();
await page.screenshot({ path: `${dir}/directory-mobile-dark.png` });
await browser.close();
console.log(
  "Saved chapter map, directory persistence and circuit screenshots.",
);
