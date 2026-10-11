import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
const entries = JSON.parse(
  await fs.readFile("src/lib/challenges/textbook-catalogue.json", "utf8"),
);
const scratch = path.resolve("../../work/section-coverage/diagrams");
await fs.mkdir(scratch, { recursive: true });
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
const origin = process.env.CAPTURE_ORIGIN || "http://localhost:3000";
const style = ".header, .skip-link, footer { visibility: hidden !important; }";
await page.goto(`${origin}/knowledge`);
await page.screenshot({ path: "docs/screenshots/coverage-knowledge.png" });
await page
  .locator("#dynamics")
  .screenshot({ path: "docs/screenshots/coverage-dynamics.png", style });
await page.goto(`${origin}/practice`);
await page.screenshot({ path: "docs/screenshots/coverage-practice.png" });
const full = new Set([
  "book-1-9-a",
  "book-3-8",
  "book-fig-7-12",
  "book-8-1",
  "book-9-8",
  "book-10-8",
  "book-11-4",
  "book-12-2",
]);
let diagrams = 0;
for (const entry of entries) {
  await page.goto(`${origin}/learn/${entry.slug}#challenge-${entry.id}`);
  const block = page.locator(`#challenge-${entry.id}`);
  const figures = block.locator(".problem-schematic");
  for (let index = 0; index < (await figures.count()); index++) {
    await figures
      .nth(index)
      .screenshot({
        path: path.join(scratch, `${entry.id}-${index}.png`),
        style,
      });
    diagrams++;
  }
  if (full.has(entry.id)) {
    await block.locator(".challenge-solution summary").click();
    await block.screenshot({
      path: `docs/screenshots/coverage-${entry.id}.png`,
      style,
    });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/knowledge#dynamics`);
await page.screenshot({
  path: "docs/screenshots/coverage-knowledge-mobile.png",
});
await page.goto(`${origin}/learn/complex-euler#challenge-book-8-1`);
await page.locator("#challenge-book-8-1 .challenge-solution summary").click();
await page
  .locator("#challenge-book-8-1")
  .screenshot({ path: "docs/screenshots/coverage-math-mobile.png", style });
await page.getByRole("button", { name: "打开目录", exact: true }).click();
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.getByRole("button", { name: "关闭目录", exact: true }).click();
await page
  .locator("#challenge-book-8-1")
  .screenshot({ path: "docs/screenshots/coverage-math-dark.png", style });
await browser.close();
console.log(
  `Captured ${entries.length} textbook groups and ${diagrams} circuit diagrams.`,
);
