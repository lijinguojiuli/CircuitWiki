import { test, expect } from "@playwright/test";

test("formula reference follows textbook chapters and removed material stays absent", async ({
  page,
}) => {
  await page.goto("/formulas");
  await expect(page.locator(".formula-group")).toHaveCount(11);
  const groups = await page
    .locator(".formula-group")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(groups).toEqual(
    [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12].map(
      (number) => `formula-chapter-${number}`,
    ),
  );
  await expect(page.locator(".formula-card h3").first()).toHaveText("瞬时功率");
  await expect(
    page
      .locator(".formula-card h3")
      .filter({ hasText: /VCVS|VCCS|CCVS|CCCS|二瓦/ }),
  ).toHaveCount(0);
  const lastNames = await page
    .locator("#formula-chapter-12 .formula-card h3")
    .allTextContents();
  expect(lastNames.slice(-2)).toEqual(["中性点位移", "三相有功功率"]);
  await page.goto("/learn/three-phase-power");
  await expect(page.locator("h1")).toHaveText("三相电路的功率");
  await expect(page.locator("body")).not.toContainText("二瓦");
  await page.getByRole("button", { name: "1800 W", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("回答正确");
  await page.getByRole("textbox", { name: "搜索知识点和公式" }).fill("二瓦计");
  await expect(page.locator(".search-results")).toContainText("未找到结果");
  await page.keyboard.press("Escape");
  await page.goto("/curriculum");
  await expect(page.locator("#chapter-3 .card-index")).toHaveText([
    "§3-4 · 核心",
    "§3-6 · 核心",
  ]);
});
