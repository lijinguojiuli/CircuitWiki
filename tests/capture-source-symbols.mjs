import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const dir = "docs/screenshots";
await page.goto("http://localhost:3000/learn/source-transformations");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
for (let index = 0; index < 4; index++)
  await page
    .locator(".source-combination")
    .nth(index)
    .screenshot({ path: `${dir}/source-combination-${index + 1}.png` });
await page.goto("http://localhost:3000/learn/input-resistance");
await page
  .locator(".example")
  .first()
  .screenshot({ path: `${dir}/input-resistance-example.png` });
await page.goto("http://localhost:3000/formulas");
await page.locator(".formula-symbols summary").click();
await page
  .locator(".formula-symbols")
  .screenshot({ path: `${dir}/formula-symbol-guide.png` });
for (const [name, file] of [
  ["电阻的串联和并联关系", "formula-rk-symbols"],
  ["输入电阻测试源法", "formula-req-symbols"],
]) {
  const card = page
    .locator(".formula-card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
  await card.locator("summary").click();
  await card.screenshot({ path: `${dir}/${file}.png` });
}
await page.goto("http://localhost:3000/learn/phasor-diagrams");
await page.getByRole("button", { name: "并联：画电流", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-parallel-rl.png` });
await page.getByRole("button", { name: "容性：RC", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-parallel-rc.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-parallel-mobile-dark.png` });
await browser.close();
console.log(
  "Saved source rules, input resistance, symbols and parallel phasor screenshots.",
);
