import { chromium } from "playwright";
import fs from "node:fs/promises";

await fs.mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
const cropStyle = ".header, .skip-link { visibility: hidden !important; }";
const origin = process.env.CAPTURE_ORIGIN || "http://localhost:3000";
await page.goto(`${origin}/practice`);
await page.screenshot({ path: "docs/screenshots/sections-practice.png" });
await page.goto(`${origin}/curriculum#chapter-7`);
await page.locator("#chapter-7").screenshot({
  path: "docs/screenshots/sections-chapter-7.png",
});

for (const [slug, id] of [
  ["star-delta", "2-4"],
  ["circuit-graphs", "3-1"],
  ["mesh-analysis", "3-4"],
  ["loop-current", "3-5"],
  ["nodal-analysis", "3-6"],
  ["thevenin", "4-3"],
  ["complete-response", "7-4"],
  ["phasor-diagrams", "9-2"],
  ["ideal-transformer", "10-5"],
  ["three-phase-power", "12-5"],
]) {
  await page.goto(`${origin}/learn/${slug}#challenge-${id}`);
  const problem = page.locator(`#challenge-${id}`);
  await problem.locator(".challenge-solution summary").click();
  await problem.screenshot({
    style: cropStyle,
    path: `docs/screenshots/sections-${slug}.png`,
  });
  const schematic = problem.locator(".problem-schematic");
  if (await schematic.count())
    await schematic.screenshot({
      style: cropStyle,
      path: `docs/screenshots/sections-diagram-${slug}.png`,
    });
}

await page.goto(`${origin}/learn/nodal-analysis#challenge-3-6`);
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page.locator("#challenge-3-6").screenshot({
  style: cropStyle,
  path: "docs/screenshots/sections-nodal-dark.png",
});
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}/practice`);
await page.screenshot({
  path: "docs/screenshots/sections-practice-mobile.png",
});
await page.goto(`${origin}/learn/complete-response#challenge-7-4`);
await page.locator(".challenge-solution summary").click();
await page.locator("#challenge-7-4").screenshot({
  style: cropStyle,
  path: "docs/screenshots/sections-response-mobile.png",
});
await browser.close();
console.log("Saved textbook section and challenging problem screenshots.");
