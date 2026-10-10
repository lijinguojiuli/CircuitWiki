import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("knowledge tree and local graph expose valid directional relationships", async ({
  page,
}) => {
  await page.goto("/knowledge");
  await expect(page.locator(".knowledge-area")).toHaveCount(6);
  await expect(page.locator(".knowledge-area .knowledge-card")).toHaveCount(40);
  await page.goto("/graph#nodal-analysis");
  await expect(page.locator(".graph-center h2")).toHaveText("节点电压法");
  await expect(page.locator(".graph-column").first()).toContainText(
    "KCL 与 KVL",
  );
  await expect(page.locator(".graph-column").last()).toContainText(
    "戴维宁定理",
  );
  await page
    .locator(".graph-column")
    .first()
    .getByRole("button", { name: /KCL 与 KVL/ })
    .click();
  await expect(page.locator(".graph-center h2")).toHaveText("KCL 与 KVL");
  await page.getByRole("button", { name: "文本列表视图" }).click();
  await expect(page.locator(".graph-neighborhood")).toHaveClass(
    /graph-as-list/,
  );
  await page.goto("/learn/nodal-analysis");
  await expect(
    page.locator(".right-sidebar .knowledge-connections"),
  ).toContainText("上级知识 · 等效与电路分析");
});

test("recommended routes contain real lessons and scoped learning outcomes", async ({
  page,
}) => {
  await page.goto("/paths");
  await expect(page.locator(".path-card")).toHaveCount(3);
  await page.locator('a[href="/paths/foundations"]').click();
  await expect(page.locator(".path-brief")).toContainText("学完能做什么");
  await expect(page.locator(".path-lessons .knowledge-card")).toHaveCount(13);
  await page.getByRole("link", { name: "开始这条路径 →" }).click();
  await expect(page).toHaveURL(/chapter-1-summary/);
});

test("legacy records, bookmarks, reading history and export/import work together", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "circuitwiki:study:v1",
      JSON.stringify({ completed: ["kcl-kvl"], lastSlug: "kcl-kvl" }),
    ),
  );
  await page.goto("/learn/rc-circuit");
  await page.getByRole("button", { name: "收藏本页", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "已收藏", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator("#section-6").scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole("progressbar", { name: "本页阅读进度" })
          .getAttribute("aria-valuenow"),
      ),
    )
    .toBeGreaterThan(20);
  await page.goto("/me");
  await expect(page.locator(".learning-stats")).toContainText("1已学页面");
  await expect(page.locator(".personal-list")).toContainText("RC 一阶电路");
  await page.getByRole("button", { name: "阅读历史", exact: true }).click();
  await expect(page.locator(".personal-list")).toContainText("最远阅读");
  await page.getByLabel("选择学习记录文件").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("broken"),
  });
  await expect(
    page.locator(".learning-backup").getByRole("alert"),
  ).toContainText("有效的 JSON");
  await page.getByLabel("选择学习记录文件").setInputFiles({
    name: "learning.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 2,
        completed: ["rc-circuit"],
        bookmarks: ["thevenin"],
      }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("已合并导入");
  await page.getByRole("button", { name: "我的收藏", exact: true }).click();
  await expect(page.locator(".personal-row")).toHaveCount(2);
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出学习记录" }).click();
  const download = await downloading;
  const path = testInfo.outputPath("learning.json");
  await download.saveAs(path);
  const exported = JSON.parse(await fs.readFile(path, "utf8"));
  expect(exported.version).toBe(2);
  expect(exported.completed).toEqual(
    expect.arrayContaining(["kcl-kvl", "rc-circuit"]),
  );
  expect(exported.bookmarks).toEqual(
    expect.arrayContaining(["thevenin", "rc-circuit"]),
  );
});

test("complete search supports formula and category filters and opens the matching card", async ({
  page,
}) => {
  await page.goto("/search?q=时间常数");
  await page.getByLabel("内容类型", { exact: true }).selectOption("公式");
  await page.getByLabel("知识分类", { exact: true }).selectOption("dynamics");
  await expect(page.locator(".search-result-list")).toContainText(
    "RC 时间常数",
  );
  await expect(page.locator(".search-result-list .cw-tag").first()).toHaveText(
    "公式",
  );
  await page
    .locator(".search-result-list a")
    .filter({
      has: page.getByRole("heading", { name: "RL 时间常数", exact: true }),
    })
    .click();
  await expect(page.locator(".formula-entry:target")).toContainText(
    "RL 时间常数",
  );
  await page.goto("/");
  await page.getByLabel("从一个问题开始", { exact: true }).fill("戴维宁");
  await page
    .locator(".home-search-form")
    .getByRole("button", { name: "搜索知识" })
    .click();
  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(page.locator(".search-result-list")).toContainText("戴维宁定理");
});

test("new workspaces fit mobile and retain dark theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "打开目录" }).click();
  await page.getByRole("button", { name: "Dark 深色", exact: true }).click();
  await page.getByRole("button", { name: "关闭目录" }).click();
  for (const route of [
    "/knowledge",
    "/paths",
    "/paths/foundations",
    "/graph#thevenin",
    "/me",
    "/search?q=电容",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBeTruthy();
  }
});
