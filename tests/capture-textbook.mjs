import { chromium } from "playwright";
import fs from "node:fs/promises";
const problems = JSON.parse(
  await fs.readFile("src/lib/challenges/textbook-catalogue.json", "utf8"),
);
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
const origin = process.env.CAPTURE_ORIGIN || "http://localhost:3000";
const style = ".header, .skip-link { visibility: hidden !important; }";
await page.goto(`${origin}/practice`);
await page.screenshot({ path: "docs/screenshots/textbook-practice.png" });
await page.goto(`${origin}/learn/storage-networks#storage-diagrams`);
for (const id of [
  "capacitor-parallel",
  "capacitor-series",
  "inductor-series",
  "inductor-parallel",
]) {
  await page
    .locator(`#${id}`)
    .screenshot({ path: `docs/screenshots/textbook-${id}.png`, style });
}
for (const problem of problems) {
  await page.goto(`${origin}/learn/${problem.slug}#challenge-${problem.id}`);
  const block = page.locator(`#challenge-${problem.id}`);
  await block.locator(".challenge-solution summary").click();
  await block.screenshot({
    path: `docs/screenshots/textbook-${problem.id}.png`,
    style,
  });
  const figures = block.locator(".problem-schematic");
  for (let index = 0; index < (await figures.count()); index++) {
    await figures
      .nth(index)
      .screenshot({
        path: `docs/screenshots/textbook-${problem.id}-diagram-${index}.png`,
        style,
      });
  }
}
await page.goto(`${origin}/learn/storage-networks#storage-diagrams`);
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page
  .locator("#capacitor-parallel")
  .screenshot({ path: "docs/screenshots/textbook-equivalent-dark.png", style });
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/practice`);
await page.screenshot({
  path: "docs/screenshots/textbook-practice-mobile.png",
});
await page.goto(`${origin}/learn/storage-networks#capacitor-series`);
await page
  .locator("#capacitor-series")
  .screenshot({
    path: "docs/screenshots/textbook-equivalent-mobile.png",
    style,
  });
await browser.close();
console.log(
  "Saved textbook exercise and four storage equivalence screenshots.",
);
