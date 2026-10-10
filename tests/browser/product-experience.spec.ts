import { test, expect } from "@playwright/test";

test("first visit has actionable entry points and completion resumes the next lesson", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".platform-intents a")).toHaveCount(3);
  await expect(page.locator(".stage-card")).toHaveCount(6);
  await expect(page.locator("main")).not.toContainText(
    /课程规划|模拟电子|数字电路/,
  );
  await page
    .locator(".study-resume")
    .getByRole("link", { name: "开始学习" })
    .click();
  await expect(page).toHaveURL(/chapter-1-summary/);
  await expect(
    page.getByRole("button", { name: "标记为已完成", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "标记为已完成", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "已完成 · 撤销标记", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/");
  const resume = page.locator(".study-resume");
  await expect(resume).toContainText("1 / 40 篇已完成");
  await expect(resume.getByRole("link", { name: "继续学习" })).toHaveAttribute(
    "href",
    "/learn/controlled-sources",
  );
  await page.goto("/curriculum");
  await expect(page.locator("#chapter-1 .chapter-progress")).toHaveText(
    "1 / 3",
  );
  await expect(page.locator("#chapter-1 .lesson-complete")).toHaveCount(1);
  await page.goto("/learn/chapter-1-summary");
  await page
    .getByRole("button", { name: "已完成 · 撤销标记", exact: true })
    .click();
  await page.goto("/");
  await expect(page.locator(".study-resume")).toContainText("0 / 40 篇已完成");
});

test("formula filters preserve textbook order, reveal symbols and recover empty results", async ({
  page,
}) => {
  await page.goto("/formulas");
  await page.getByLabel("筛选公式", { exact: true }).fill("时间常数");
  await expect(page.locator(".formula-card h3")).toHaveText([
    "RC 时间常数",
    "RL 时间常数",
    "RL 零输入响应",
    "一阶电路的全响应关系",
  ]);
  await expect(page.getByRole("status")).toContainText("4 / 69");
  await page.getByRole("button", { name: "清空公式搜索" }).click();
  await page.getByLabel("筛选公式章节").selectOption("12");
  await expect(page.locator(".formula-group")).toHaveCount(1);
  await expect(page.locator(".formula-group")).toHaveAttribute(
    "id",
    "formula-chapter-12",
  );
  await page.getByLabel("筛选公式", { exact: true }).fill("无此公式");
  await expect(
    page.getByRole("heading", { name: "没有匹配的公式" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "清除筛选" }).click();
  await expect(page.locator(".formula-card")).toHaveCount(69);
  await page.getByLabel("筛选公式", { exact: true }).fill("Rk");
  expect(await page.locator(".formula-card").count()).toBeGreaterThan(0);
  await page.locator(".formula-card details summary").first().click();
  await expect(page.locator(".formula-card details").first()).toContainText(
    "编号",
  );
});

test("keyboard search opens a formula even when the reference is filtered to another chapter", async ({
  page,
}) => {
  await page.goto("/formulas");
  await page.getByLabel("筛选公式章节").selectOption("1");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("textbox", { name: "搜索知识点和公式" });
  await expect(search).toBeFocused();
  await search.fill("RL 时间常数");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".search-results a").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/formulas#formula-7-2-/);
  await expect(page.getByLabel("筛选公式章节")).toHaveValue("all");
  await expect(page.locator(".formula-entry:target")).toContainText(
    "RL 时间常数",
  );
  await expect(page.locator(".formula-entry:target")).toBeInViewport();
  await search.fill("RC 计算器");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tools#rc/);
  await expect(page.locator("#rc")).toBeInViewport();
});

test("reading navigation follows the current section without changing the lesson directory", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/learn/rc-circuit");
  const before = await page
    .locator(".left-sidebar")
    .evaluate((element) => element.scrollTop);
  await page
    .locator(".right-sidebar .toc a")
    .filter({ hasText: "典型例题" })
    .click();
  await expect(
    page.locator('.right-sidebar .toc a[aria-current="location"]'),
  ).toContainText("典型例题");
  expect(
    await page
      .locator(".left-sidebar")
      .evaluate((element) => element.scrollTop),
  ).toBe(before);
  await expect(page.locator(".lesson-shortcuts")).toContainText("本章全览");
});

test("damaged or unavailable local storage does not prevent reading and recording progress", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("circuitwiki:study:v1", "invalid-json"),
  );
  await page.goto("/learn/nodal-analysis");
  await page.getByRole("button", { name: "标记为已完成", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已完成 · 撤销标记", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("quota exceeded");
    };
  });
  await page.locator('.left-sidebar a[href="/learn/rc-circuit"]').click();
  await page.getByRole("button", { name: "标记为已完成", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已完成 · 撤销标记", exact: true }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("storage disabled");
    };
    Storage.prototype.setItem = () => {
      throw new Error("storage disabled");
    };
  });
  await page.goto("/learn/rc-circuit");
  await page.getByRole("button", { name: "标记为已完成", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已完成 · 撤销标记", exact: true }),
  ).toBeVisible();
});

test("mobile appearance controls live in the menu and do not cover learning content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/formulas");
  await expect(page.locator(".header > .theme-toggle")).toBeHidden();
  await page.getByRole("button", { name: "打开目录" }).click();
  await page
    .locator(".mobile-settings")
    .getByRole("button", { name: "Dark 深色", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "关闭目录" }).click();
  await expect(page.locator(".mobile-menu")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("completion updates across tabs in the same browser", async ({
  page,
  context,
}) => {
  await page.goto("/curriculum");
  const lesson = await context.newPage();
  await lesson.goto("/learn/kcl-kvl");
  await lesson
    .getByRole("button", { name: "标记为已完成", exact: true })
    .click();
  await expect(page.locator("#chapter-1 .chapter-progress")).toHaveText(
    "1 / 3",
  );
  await expect(page.locator(".study-resume")).toContainText("1 / 40 篇已完成");
  await lesson.close();
});

test("confirming Chinese input does not prematurely open a search result", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "搜索知识点和公式" });
  await search.fill("节点电压法");
  await search.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(page).toHaveURL("/");
  await expect(page.locator(".search-results")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/nodal-analysis/);
});
