import { test, expect } from "@playwright/test";
import { articles } from "../../src/lib/content";
test("bridge one-port switches state and recomputes source contributions", async ({
  page,
}) => {
  await page.goto("/learn/bridge-arm");
  const lab = page.locator(".bridge-port-lab");
  await expect(lab.locator(".port-results")).toContainText("uoc = 14 V");
  await lab.getByRole("button", { name: "短路", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText("短路电流为7 mA");
  await lab.getByRole("button", { name: "带载", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText("负载电流为2.8 mA");
  await lab.getByLabel("电压源 US").fill("10");
  await expect(lab.locator(".port-results")).toContainText("uoc = 18 V");
  await expect(lab.locator(".port-results")).toContainText("负载电流为3.6 mA");
  await lab.getByRole("button", { name: "源置零", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText("输入电阻为2000 Ω");
  await lab.getByLabel("并联电阻 R").fill("0");
  await expect(lab.getByRole("alert")).toContainText("正数");
});
test("branch grouping preserves loop count and distinguishes a mesh from an outer loop", async ({
  page,
}) => {
  await page.goto("/learn/kcl-kvl#topology-definitions");
  const lab = page.locator(".multi-loop-lab");
  await expect(lab.locator(".topology-counts")).toContainText("b = 5");
  await expect(lab.locator(".topology-counts")).toContainText("n = 3");
  await expect(lab.locator(".loop-choices button")).toHaveCount(6);
  await lab
    .getByRole("button", { name: "L₁₄：最外侧回路", exact: true })
    .click();
  await expect(lab.locator(".loop-detail")).toContainText("e1 → e2 → e5");
  await expect(lab.locator(".loop-detail")).toContainText("不是网孔");
  await lab
    .getByRole("button", { name: "左侧串联组合成一条支路", exact: true })
    .click();
  await expect(lab.locator(".topology-counts")).toContainText("b = 4");
  await expect(lab.locator(".topology-counts")).toContainText("n = 2");
  await expect(lab.locator(".topology-counts")).toContainText("b − n + 1 = 3");
  await expect(lab.locator(".loop-detail")).toContainText("b1 → b4");
  await lab.getByRole("button", { name: "L₂₃：中间网孔", exact: true }).click();
  await expect(lab.locator(".loop-detail")).toContainText("既是回路，也是网孔");
});
test("all public routes render, formulas work, internal links and anchors resolve", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const targets = new Set<string>();
  for (const route of [
    "/",
    ...articles.map((a) => `/learn/${a.slug}`),
    "/formulas",
    "/tools",
    "/curriculum",
    "/topics/analog",
    "/topics/digital",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    if (route.startsWith("/learn/")) {
      await expect(page.locator('.prose h2[id^="section-"]')).toHaveCount(8);
      expect(await page.locator(".katex").count()).toBeGreaterThan(0);
    }
    const links = await page
      .locator("a[href]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    for (const href of links) {
      if (href.startsWith("/")) targets.add(href.split("#")[0]);
      if (href.startsWith("#"))
        expect(
          await page
            .locator(`[id="${decodeURIComponent(href.slice(1))}"]`)
            .count(),
          `${route} ${href}`,
        ).toBeGreaterThan(0);
    }
  }
  for (const target of targets)
    expect((await request.get(target)).status(), target).toBe(200);
  expect(errors).toEqual([]);
});
test("search, quiz, themes and persistence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "搜索知识点和公式" }).fill("戴维南");
  await page
    .locator(".search-results")
    .getByRole("link", { name: /戴维南定理/ })
    .click();
  await expect(page).toHaveURL(/thevenin/);
  await page.getByRole("button", { name: "短路", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("回答正确");
  await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Light 浅色", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await page
    .getByRole("button", { name: "System 跟随系统", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
test("three calculators recompute and explain invalid inputs", async ({
  page,
}) => {
  await page.goto("/tools");
  const ohm = page.locator("#ohm");
  await expect(ohm.locator(".results")).toContainText("0.012");
  await ohm.getByLabel("电阻 R").fill("0");
  await expect(ohm.getByRole("alert")).toContainText("大于 0");
  await ohm.getByLabel("电阻 R").fill("2000");
  await expect(ohm.locator(".results")).toContainText("0.006");
  const rc = page.locator("#rc");
  await expect(rc.locator(".rc-stats")).toContainText("0.1 s");
  await rc.getByLabel("电阻 R").fill("2000");
  await expect(rc.locator(".rc-stats")).toContainText("0.2 s");
  await expect(rc.locator(".recharts-line-curve")).toBeVisible();
  await rc.getByLabel("电容 C").fill("-1");
  await expect(rc.getByRole("alert")).toBeVisible();
  await rc.getByLabel("电容 C").fill("100");
  const phasor = page.locator("#phasor");
  await expect(phasor.locator(".phasor-output")).toContainText("8.66025");
  await phasor.getByRole("button", { name: "直角坐标 → 极坐标" }).click();
  await expect(phasor.locator(".phasor-output")).toContainText("53.1301");
  await phasor.getByLabel("运算方式").selectOption("subtract");
  await expect(phasor.locator(".phasor-output")).toContainText("2 + j2");
  await phasor.getByLabel("A 实部").fill("1");
  await phasor.getByLabel("A 虚部").fill("2");
  await expect(phasor.locator(".phasor-output")).toContainText(
    "未定义（零相量）",
  );
});
test("mobile navigation and no page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/learn/kcl-kvl",
    "/learn/nodal-analysis",
    "/learn/mesh-analysis",
    "/learn/thevenin",
    "/learn/rc-circuit",
    "/learn/phasor",
    "/formulas",
    "/tools",
    "/learn/star-delta",
    "/learn/three-phase-basics",
    "/learn/line-phase",
    "/learn/balanced-three-phase",
    "/learn/unbalanced-three-phase",
    "/learn/three-phase-power",
    "/learn/superposition",
    "/learn/source-transformations",
    "/learn/controlled-sources",
    "/learn/bridge-arm",
    "/learn/coupled-inductors",
    "/learn/rlc",
    "/curriculum",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "打开目录" }).click();
  await expect(page.locator(".mobile-menu")).toBeVisible();
  await page
    .locator(".mobile-menu")
    .getByRole("link", { name: "节点电压法", exact: true })
    .click();
  await expect(page).toHaveURL(/nodal-analysis/);
  await expect(page.locator(".mobile-menu")).toHaveCount(0);
  await page.locator(".mobile-toc summary").click();
  await page
    .locator(".mobile-toc")
    .getByRole("link", { name: /核心公式/ })
    .click();
  await expect(page).toHaveURL(/#section-3/);
});
