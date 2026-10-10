import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const dir = "docs/screenshots";
await page.goto("http://localhost:3000/formulas");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page
  .locator("#formula-chapter-7")
  .screenshot({ path: `${dir}/time-constants-req.png` });
for (const [name, file] of [
  ["并联电容补偿", "compensation-secondary"],
  ["中性点位移", "neutral-secondary"],
]) {
  const card = page
    .locator(".formula-card")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });
  await card.screenshot({ path: `${dir}/${file}.png` });
}
await page.goto("http://localhost:3000/learn/chapter-10-summary");
await page
  .locator("#textbook-10-5")
  .screenshot({ path: `${dir}/ideal-transformer.png` });
await page.goto("http://localhost:3000/learn/power-factor");
await page
  .locator("#capacitor-compensation")
  .screenshot({ path: `${dir}/compensation-secondary-content.png` });
await page.goto("http://localhost:3000/learn/unbalanced-three-phase");
await page
  .locator("#neutral-displacement")
  .screenshot({ path: `${dir}/neutral-secondary-content.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page
  .locator("#neutral-displacement")
  .screenshot({ path: `${dir}/neutral-secondary-mobile-dark.png` });
await browser.close();
console.log("Saved Req, transformer and secondary-topic screenshots.");
