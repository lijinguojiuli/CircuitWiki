import { auditSvg } from "./helpers/svg-audit.mjs";
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const destination = path.resolve(
  process.env.AUDIT_OUTPUT || "../../work/diagram-audit/latest",
);
await fs.mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
});
const page = await browser.newPage({
  viewport: { width: Number(process.env.AUDIT_WIDTH || 1440), height: 1000 },
  colorScheme: process.env.AUDIT_THEME || "light",
});
const origin = process.env.AUDIT_ORIGIN || "http://localhost:3000";
await page.addInitScript(
  (theme) => localStorage.setItem("circuitwiki-theme-monochrome", theme),
  process.env.AUDIT_THEME || "light",
);
await page.goto(`${origin}/knowledge`);
await page.waitForLoadState("networkidle");
const routes = await page
  .locator('main a[href^="/learn/"]')
  .evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href"))),
  ]);
routes.push("/", "/tools");
const seen = new Set();
const diagrams = [];
async function inspect(route, variant = "default") {
  const svgs = page.locator("main svg[viewBox]:has(text)");
  for (let index = 0; index < (await svgs.count()); index++) {
    const svg = svgs.nth(index);
    if (!(await svg.isVisible())) continue;
    const markup = await svg.evaluate((element) =>
      element.outerHTML.replace(/(?:id="[^"]*"|url\(#[^)]*\))/g, "ID"),
    );
    const hash = crypto
      .createHash("sha256")
      .update(markup)
      .digest("hex")
      .slice(0, 12);
    if (seen.has(hash)) continue;
    seen.add(hash);
    const geometry = await svg.evaluate(auditSvg);
    const number = String(diagrams.length + 1).padStart(3, "0");
    const filename = `${number}-${hash}.png`;
    if (process.env.AUDIT_SCREENSHOTS !== "false" || geometry.collisions.length)
      await svg.screenshot({
        path: path.join(destination, filename),
        style: ".header,.skip-link { visibility:hidden!important; }",
      });
    diagrams.push({ number, route, variant, index, filename, ...geometry });
  }
}
for (const route of routes) {
  await page.goto(origin + route);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() =>
    document
      .querySelectorAll("main details")
      .forEach((details) => (details.open = true)),
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await inspect(route);
  if (route === "/learn/circuit-graphs" || route === "/learn/kcl-kvl") {
    const lab = page.locator(".multi-loop-lab");
    if (await lab.count())
      for (const mode of ["每个元件一条支路", "左侧串联组合成一条支路"]) {
        await lab.getByRole("button", { name: mode, exact: true }).click();
        const choices = lab.locator(".loop-choices button");
        for (let i = 0; i < (await choices.count()); i++) {
          await choices.nth(i).click();
          await inspect(route, `${mode}-${i}`);
        }
      }
  }
  if (route === "/learn/phasor-diagrams") {
    const lab = page.locator(".phasor-construction");
    for (const mode of ["串联：画电压", "并联：画电流"]) {
      await lab.getByRole("button", { name: mode, exact: true }).click();
      for (const option of ["感性：RL", "容性：RC", "谐振：RLC"]) {
        await lab.getByRole("button", { name: option, exact: true }).click();
        await inspect(route, `${mode}-${option}`);
      }
    }
  }
  if (route === "/learn/bridge-arm") {
    const lab = page.locator(".bridge-port-lab");
    for (const mode of ["开路", "短路", "源置零", "带载"]) {
      await lab.getByRole("button", { name: mode, exact: true }).click();
      await inspect(route, mode);
    }
  }
  console.log(`${route}: ${diagrams.length} unique diagrams`);
}
await fs.writeFile(
  path.join(destination, "audit.json"),
  JSON.stringify(diagrams, null, 2),
);
await browser.close();
console.log(
  JSON.stringify({
    routes: routes.length,
    diagrams: diagrams.length,
    flagged: diagrams.filter((item) => item.collisions.length).length,
  }),
);

if (process.env.AUDIT_ASSERT && diagrams.some((item) => item.collisions.length))
  throw new Error("Diagram labels overlap; see audit.json");
