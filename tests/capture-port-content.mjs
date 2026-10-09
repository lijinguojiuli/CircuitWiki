import { chromium } from "playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const captures = [
  ["/learn/source-transformations", ".prose .circuit", "source-transform"],
  [
    "/learn/controlled-sources",
    ".controlled-source-grid",
    "controlled-sources",
  ],
  ["/learn/thevenin", ".port-diagram-grid", "thevenin-methods"],
  ["/learn/bridge-arm", ".bridge-port-lab", "bridge-arm"],
];
for (const [url, selector, name] of captures) {
  await page.goto("http://localhost:3000" + url);
  await page
    .locator(selector)
    .first()
    .screenshot({ path: `docs/screenshots/${name}.png` });
}
await page
  .locator(".bridge-port-lab")
  .getByRole("button", { name: "带载", exact: true })
  .click();
await page
  .locator(".bridge-port-lab")
  .screenshot({ path: "docs/screenshots/bridge-arm-loaded.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page
  .locator(".bridge-port-lab")
  .screenshot({ path: "docs/screenshots/bridge-arm-mobile.png" });
await browser.close();
console.log("Saved port topic screenshots.");
