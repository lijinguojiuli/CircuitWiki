import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const shots = [
  ["/learn/kcl-kvl", ".topology-diagram", "topology"],
  ["/learn/star-delta", ".prose .circuit", "star-delta"],
  ["/learn/three-phase-basics", ".prose .circuit", "three-phase"],
  ["/learn/rc-circuit", ".response-types", "rc-responses"],
];
for (const [url, selector, name] of shots) {
  await page.goto("http://localhost:3000" + url);
  await page
    .locator(selector)
    .first()
    .screenshot({ path: `docs/screenshots/${name}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/learn/rc-circuit");
await page
  .locator(".response-types")
  .screenshot({ path: "docs/screenshots/rc-responses-mobile.png" });
await browser.close();
console.log("Saved new content screenshots.");
