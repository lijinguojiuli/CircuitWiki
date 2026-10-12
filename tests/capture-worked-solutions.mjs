import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { challengeIndex } from "../src/lib/challenges/catalogue.ts";
const solutions = JSON.parse(
  await fs.readFile("src/lib/challenges/worked-solutions.json", "utf8"),
);
const scratch = path.resolve("../../work/all-solutions/steps");
await fs.mkdir(scratch, { recursive: true });
await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() =>
  localStorage.setItem("circuitwiki-theme-monochrome", "light"),
);
const origin = process.env.CAPTURE_ORIGIN || "http://localhost:3000";
const examples = JSON.parse(
  await fs.readFile("src/lib/challenges/worked-example-index.json", "utf8"),
);
const selected = {
  "example-thevenin-divider": [1, 5, 7, 8],
  "book-2-7": [1, 2],
  "4-3": [2, 6],
  "book-4-9-a": [7],
  "book-6-8": [1, 6, 8],
  "book-6-9": [4],
};
const records = [];
const style = ".header,.skip-link {visibility:hidden!important;}";
for (const [id, steps] of Object.entries(solutions)) {
  const example = id.startsWith("example-");
  const slug = example
    ? examples[id].slug
    : challengeIndex.find((entry) => entry.id === id).slug;
  await page.goto(`${origin}/learn/${slug}`);
  await page.waitForLoadState("networkidle");
  const scope = page.locator(
    example
      ? `[data-worked-example="${id}"]`
      : `#challenge-${id} .challenge-solution`,
  );
  if (!example) await scope.locator("summary").click();
  for (let i = 0; i < steps.length; i++) {
    if (!steps[i].figure) continue;
    const step = scope.locator("[data-worked-step]").nth(i);
    const filename = `${id}-${i + 1}.png`;
    await step
      .getByRole("img")
      .screenshot({ path: path.join(scratch, filename), style });
    records.push({ id, step: i + 1, title: steps[i].title, filename });
    if (selected[id]?.includes(i + 1))
      await step.screenshot({
        path: `docs/screenshots/worked-${id}-${i + 1}.png`,
        style,
      });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/learn/thevenin`);
const step = page.locator(
  '[data-worked-example="example-thevenin-divider"] [data-worked-step="8"]',
);
await step
  .locator(".diagram-scroll")
  .evaluate((e) => (e.scrollLeft = e.scrollWidth));
await step.screenshot({
  path: "docs/screenshots/worked-mobile-load.png",
  style,
});
await fs.writeFile(
  path.join(scratch, "index.json"),
  JSON.stringify(records, null, 2),
);
await browser.close();
console.log(`Captured ${records.length} worked step figures.`);
