import { test, expect } from "@playwright/test";

test("desktop directory keeps its scroll position across lessons, history and reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/learn/capacitor");
  const panel = page.locator(".left-sidebar");
  await panel.evaluate((el) => {
    const target = el.querySelector('a[href="/learn/rc-circuit"]')!;
    el.scrollTop +=
      target.getBoundingClientRect().top - el.getBoundingClientRect().top - 140;
  });
  const before = await panel.evaluate((el) => el.scrollTop);
  expect(before).toBeGreaterThan(150);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await panel.getByRole("link", { name: "RC 一阶电路", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("RC 一阶电路");
  await expect(page.locator("h1")).toBeInViewport();
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeCloseTo(before, 0);
  await panel.getByRole("link", { name: "RL 一阶电路", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("RL 一阶电路");
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeCloseTo(before, 0);
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("RC 一阶电路");
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeCloseTo(before, 0);
  await page.reload();
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeCloseTo(before, 0);
});

test("mobile directory remembers its position when reopened after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/capacitor");
  await page.getByRole("button", { name: "打开目录", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "关闭目录", exact: true }),
  ).toBeVisible();
  const panel = page.locator(".mobile-menu");
  await panel.evaluate((el) => {
    const target = el.querySelector('a[href="/learn/rc-circuit"]')!;
    el.scrollTop +=
      target.getBoundingClientRect().top - el.getBoundingClientRect().top - 140;
  });
  const before = await panel.evaluate((el) => el.scrollTop);
  expect(before).toBeGreaterThan(150);
  await panel.getByRole("link", { name: "RC 一阶电路", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("RC 一阶电路");
  await page.getByRole("button", { name: "打开目录", exact: true }).click();
  await expect
    .poll(() => panel.evaluate((el) => el.scrollTop))
    .toBeCloseTo(before, 0);
});

test("chapter map, breadcrumbs and reading order match the textbook scope", async ({
  page,
}) => {
  await page.goto("/curriculum");
  await expect(page.locator('.curriculum-group[id^="chapter-"]')).toHaveCount(
    11,
  );
  await expect(page.locator("#chapter-5")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/只学|跳过/);
  await expect(page.locator("#chapter-11 .knowledge-card")).toHaveCount(2);
  await expect(page.locator("#chapter-11")).toContainText("RLC 串联与并联谐振");
  await page
    .locator("#chapter-10")
    .getByRole("link", { name: /耦合电感与同名端/ })
    .click();
  await expect(page.locator(".breadcrumb")).toContainText("第10章");
  await expect(page.locator('nav[aria-label="文章翻页"]')).toContainText(
    "串联与并联谐振全览",
  );
  await page.goto("/learn/norton");
  await expect(page.locator('nav[aria-label="文章翻页"]')).toContainText(
    "储能元件全览",
  );
});
