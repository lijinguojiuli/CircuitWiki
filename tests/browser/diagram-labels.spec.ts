import { test, expect } from "@playwright/test";
import { auditSvg } from "../helpers/svg-audit.mjs";
import { createHash } from "node:crypto";

for (const { width, theme } of [
  { width: 1440, theme: "light" },
  { width: 390, theme: "dark" },
] as const) {
  test(`diagram labels remain clear across all lessons at ${width}px in ${theme} mode`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(
      (value) => localStorage.setItem("circuitwiki-theme-monochrome", value),
      theme,
    );
    await page.goto("/knowledge");
    await page.waitForLoadState("networkidle");
    expect(
      await page
        .locator("html")
        .evaluate((element, value) => element.classList.contains(value), theme),
    ).toBe(true);
    const routes = await page
      .locator('main a[href^="/learn/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href")!)),
      ]);
    expect(routes).toHaveLength(59);
    const seen = new Set<string>();
    const inspect = async (context: string) => {
      const svgs = page.locator("main svg[viewBox]:has(text)");
      for (let i = 0; i < (await svgs.count()); i++) {
        const svg = svgs.nth(i);
        if (!(await svg.isVisible())) continue;
        const markup = await svg.evaluate((element) =>
          element.outerHTML.replace(/(?:id="[^"]*"|url\(#[^)]*\))/g, "ID"),
        );
        const hash = createHash("sha256").update(markup).digest("hex");
        if (seen.has(hash)) continue;
        seen.add(hash);
        const result = await svg.evaluate(auditSvg);
        expect(result.collisions, `${context}: ${result.title}`).toEqual([]);
      }
    };
    for (const route of [...routes, "/", "/tools"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.evaluate(async () => {
        document
          .querySelectorAll("main details")
          .forEach((details) => ((details as HTMLDetailsElement).open = true));
        await document.fonts.ready;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
      });
      await inspect(route);
      if (width === 390 && route === "/learn/series-parallel") {
        const figure = page.locator("#challenge-book-2-4-a .problem-schematic");
        const caption = figure.locator("figcaption");
        const left = (await caption.boundingBox())!.x;
        const pane = figure.locator(".diagram-scroll");
        await pane.evaluate(
          (element) => (element.scrollLeft = element.scrollWidth),
        );
        expect(
          await pane.evaluate((element) => element.scrollLeft),
        ).toBeGreaterThan(100);
        expect((await caption.boundingBox())!.x).toBeCloseTo(left, 1);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      if (route === "/learn/kcl-kvl") {
        const lab = page.locator(".multi-loop-lab");
        for (const mode of ["每个元件一条支路", "左侧串联组合成一条支路"]) {
          await lab.getByRole("button", { name: mode, exact: true }).click();
          const choices = lab.locator(".loop-choices button");
          for (let i = 0; i < (await choices.count()); i++) {
            await choices.nth(i).click();
            await inspect(`${route}: ${mode}, loop ${i}`);
          }
        }
      }
      if (route === "/learn/phasor-diagrams") {
        const lab = page.locator(".phasor-construction");
        for (const mode of ["串联：画电压", "并联：画电流"]) {
          await lab.getByRole("button", { name: mode, exact: true }).click();
          for (const option of ["感性：RL", "容性：RC", "谐振：RLC"]) {
            await lab
              .getByRole("button", { name: option, exact: true })
              .click();
            for (const step of [1, 2, 3, 4]) {
              await lab.getByRole("slider").fill(String(step));
              await inspect(`${route}: ${mode}, ${option}, step ${step}`);
            }
          }
        }
      }
      if (route === "/learn/bridge-arm") {
        const lab = page.locator(".bridge-port-lab");
        for (const mode of ["开路", "短路", "源置零", "带载"]) {
          await lab.getByRole("button", { name: mode, exact: true }).click();
          await inspect(`${route}: ${mode}`);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(130);
  });
}

test("the geometry audit detects wire crossings, label collisions and clipped text", async ({
  page,
}) => {
  await page.setContent(
    '<svg viewBox="0 0 100 100" width="250" height="250"><path d="M50 10V90" stroke="black"/><text x="45" y="50">a</text><text x="45" y="50">Y</text><text x="95" y="95">outside</text></svg>',
  );
  const result = await page.locator("svg").evaluate(auditSvg);
  expect(result.collisions.map((item) => item.kind)).toEqual(
    expect.arrayContaining(["stroke", "text", "clipped"]),
  );
});
