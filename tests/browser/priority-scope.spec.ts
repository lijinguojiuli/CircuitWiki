import { test, expect } from "@playwright/test";
test("Req notation, ideal transformer scope and secondary topic labels render consistently", async ({
  page,
}) => {
  await page.goto("/formulas");
  await expect(page.locator(".formula-card")).toHaveCount(69);
  for (const name of ["中性点位移", "并联电容补偿"]) {
    const card = page
      .locator(".formula-card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card).toHaveAttribute("data-emphasis", "secondary");
    await expect(card.locator(".secondary-badge")).toHaveText("非重点");
  }
  await expect(
    page.locator(".formula-card h3").filter({ hasText: "变压器原理" }),
  ).toHaveCount(0);
  await expect(
    page.locator(".formula-card h3").filter({ hasText: "理想变压器" }),
  ).toHaveCount(1);
  const rc = page
    .locator(".formula-card")
    .filter({
      has: page.getByRole("heading", { name: "RC 时间常数", exact: true }),
    });
  await expect(rc.locator("annotation")).toHaveText("\\tau=R_{eq}C");
  await page.goto("/learn/chapter-10-summary");
  await expect(page.locator("#textbook-10-4")).toHaveCount(0);
  await expect(page.locator("#textbook-10-5")).toContainText("理想变压器");
  await page.goto("/learn/power-factor");
  await expect(
    page.locator("#capacitor-compensation .secondary-badge"),
  ).toHaveText("非重点");
  await page.goto("/learn/unbalanced-three-phase");
  await expect(
    page.locator("#neutral-displacement .secondary-badge"),
  ).toHaveText("非重点");
  await page.goto("/curriculum");
  await expect(page.locator("#chapter-9")).toContainText("非重点");
  await expect(page.locator("#chapter-12")).toContainText("非重点");
});
