import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const dir = "docs/screenshots";
await page.goto("http://localhost:3000/learn/phasor-diagrams");
await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-drawing-rl.png` });
await page.getByRole("button", { name: "容性：RC", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-drawing-rc.png` });
await page.goto("http://localhost:3000/learn/sinusoidal");
await page
  .locator(".sinusoidal-lab")
  .screenshot({ path: `${dir}/sinusoidal-calculation.png` });
await page.goto("http://localhost:3000/learn/line-phase");
await page
  .locator(".three-phase-lab")
  .screenshot({ path: `${dir}/three-phase-y.png` });
await page.getByRole("button", { name: "Δ 三角形", exact: true }).click();
await page
  .locator(".three-phase-lab")
  .screenshot({ path: `${dir}/three-phase-delta.png` });
await page.goto("http://localhost:3000/learn/three-phase-basics");
await page
  .locator(".circuit")
  .first()
  .screenshot({ path: `${dir}/three-phase-sources.png` });
await page.goto("http://localhost:3000/learn/rlc");
await page
  .locator(".circuit")
  .nth(1)
  .screenshot({ path: `${dir}/parallel-resonance.png` });
await page.goto("http://localhost:3000/curriculum");
await page.locator("#chapter-7 .coverage-detail summary").click();
await page
  .locator("#chapter-7")
  .screenshot({ path: `${dir}/chapter-seven-coverage.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/learn/line-phase");
await page.getByRole("button", { name: "Δ 三角形", exact: true }).click();
await page
  .locator(".three-phase-lab")
  .screenshot({ path: `${dir}/three-phase-delta-mobile.png` });
await page.goto("http://localhost:3000/learn/phasor-diagrams");
await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
await page
  .locator(".phasor-construction")
  .screenshot({ path: `${dir}/phasor-drawing-mobile-dark.png` });
await browser.close();
console.log("Saved learning expansion screenshots.");
