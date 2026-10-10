import { test, expect } from "@playwright/test";

test("source combinations, input resistance and symbol explanations are available", async ({
  page,
}) => {
  await page.goto("/learn/source-transformations");
  const figures = page.locator(".source-combination");
  await expect(figures).toHaveCount(4);
  expect(
    await figures.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-equivalent")),
    ),
  ).toEqual([
    "voltage-source",
    "current-source",
    "voltage-source",
    "current-source",
  ]);
  await expect(page.locator(".prose")).toContainText("内部电流、压降或损耗");
  await page.goto("/learn/input-resistance");
  await expect(page.locator("h1")).toHaveText("输入电阻");
  await expect(page.locator(".prose")).toContainText("1333.33");
  await expect(page.locator(".prose")).toContainText("666.67");
  await page.goto("/formulas");
  await expect(page.locator(".formula-card")).toHaveCount(69);
  await expect(page.locator(".formula-symbols")).toContainText("Req");
  await expect(page.locator(".formula-symbols")).toContainText("Rk");
  const card = page.locator(".formula-card").filter({
    has: page.getByRole("heading", {
      name: "电阻的串联和并联关系",
      exact: true,
    }),
  });
  await card.locator("summary").click();
  await expect(card).toContainText("k是编号，不是乘法");
  await page.goto("/curriculum");
  await expect(page.locator("#chapter-5")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/只学|跳过|戴维南/);
  await page.goto("/learn/thevenin");
  await expect(page.locator("h1")).toHaveText("戴维宁定理");
  await expect(page.locator('.left-sidebar [data-chapter="5"]')).toHaveCount(0);
});

test("parallel drawing switches between lagging, leading and resonant current", async ({
  page,
}) => {
  await page.goto("/learn/phasor-diagrams");
  const lab = page.locator(".phasor-construction");
  await lab.getByRole("button", { name: "并联：画电流", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText(
    "总电流：1.41421∠-45° A",
  );
  await expect(lab.getByRole("img")).toHaveAttribute("aria-label", /并联/);
  await lab.getByRole("button", { name: "容性：RC", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText("1.41421∠45°");
  await lab.getByRole("button", { name: "谐振：RLC", exact: true }).click();
  await expect(lab.locator(".port-results")).toContainText("总电流：1∠0° A");
});
