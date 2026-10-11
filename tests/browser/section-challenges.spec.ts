import { test, expect } from "@playwright/test";
test("textbook directory shows every section and no aggregate lessons", async ({
  page,
}) => {
  await page.goto("/curriculum");
  await expect(page.locator(".curriculum-grid .knowledge-card")).toHaveCount(
    53,
  );
  await expect(page.locator("main")).not.toContainText("全览");
  await page.goto("/practice");
  await expect(page.locator(".practice-card")).toHaveCount(53);
  await page.getByLabel("练习章节", { exact: true }).selectOption("7");
  await expect(page.locator(".practice-card")).toHaveCount(4);
  await page.getByLabel("题目类型", { exact: true }).selectOption("综合挑战");
  await expect(page.locator(".practice-card")).toHaveCount(1);
  await page.locator(".practice-card").click();
  await expect(page).toHaveURL(/complete-response#challenge-7-4/);
});
test("legacy chapter and deep-section bookmarks resolve to individual lessons", async ({
  page,
}) => {
  await page.goto("/learn/chapter-10-summary#textbook-10-5");
  await expect(page).toHaveURL(/ideal-transformer#textbook-10-5/);
  await expect(page.locator("h1")).toHaveText("理想变压器");
  await page.goto("/learn/chapter-1-summary");
  await expect(page).toHaveURL(/circuit-model$/);
  await expect(page.locator("h1")).toHaveText("电路和电路模型");
});
test("challenging nodal problem keeps hints and solution optional and renders all math", async ({
  page,
}) => {
  await page.goto("/learn/nodal-analysis#challenge-3-6");
  const problem = page.locator("#challenge-3-6");
  await expect(problem.locator(".challenge-tasks li")).toHaveCount(3);
  await expect(problem.locator(".challenge-solution")).toHaveJSProperty(
    "open",
    false,
  );
  await problem.locator(".challenge-hints summary").click();
  await expect(problem.locator(".challenge-hints")).toContainText("电压约束");
  await problem.locator(".challenge-solution summary").click();
  await expect(problem.locator(".challenge-answer")).toContainText("7.77778");
  await expect(problem.locator(".problem-schematic svg")).toBeVisible();
  await expect(problem.locator(".katex-error")).toHaveCount(0);
});
test("challenge pages fit mobile with long answers and dark diagrams", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const slug of [
    "nodal-analysis",
    "complete-response",
    "phasor-diagrams",
    "ideal-transformer",
    "parallel-resonance",
    "unbalanced-three-phase",
    "three-phase-power",
  ]) {
    await page.goto(`/learn/${slug}`);
    await page.locator(".challenge-solution summary").click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      slug,
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "打开目录" }).click();
  await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
  await page.getByRole("button", { name: "关闭目录" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator(".challenge-solution")).toHaveJSProperty(
    "open",
    true,
  );
});
