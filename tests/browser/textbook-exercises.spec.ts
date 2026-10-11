import { test, expect } from "@playwright/test";
import textbookIndex from "../../src/lib/challenges/textbook-catalogue.json";

test("storage networks explain all four original and equivalent circuits", async ({
  page,
}) => {
  await page.goto("/learn/storage-networks#storage-diagrams");
  await expect(page.locator("[data-storage-kind]")).toHaveCount(4);
  for (const name of [
    "capacitor-parallel",
    "capacitor-series",
    "inductor-series",
    "inductor-parallel",
  ]) {
    const block = page.locator(`[data-storage-kind="${name}"]`);
    await expect(block.getByRole("img")).toHaveCount(1);
    await expect(block).toContainText("等效电路");
    await expect(block).toContainText("初始值怎么保留");
  }
  await expect(page.locator("#capacitor-series")).toContainText("1.2 μF");
  await expect(page.locator("#inductor-parallel")).toContainText("1.2 mH");
  await page.setViewportSize({ width: 390, height: 844 });
  const diagram = page.locator(".storage-svg-scroll").first();
  expect(
    await diagram.evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBeTruthy();
  await diagram.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  expect(await diagram.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("textbook catalogue leads to attributed figures, worked solutions and the key decision", async ({
  page,
}) => {
  await page.goto("/practice");
  await expect(page.getByLabel("题目来源", { exact: true })).toHaveValue(
    "textbook",
  );
  await expect(page.locator(".practice-card")).toHaveCount(10);
  await page.getByLabel("练习章节", { exact: true }).selectOption("6");
  await expect(page.locator(".practice-card")).toHaveCount(3);
  for (const entry of textbookIndex) {
    await page.goto(`/learn/${entry.slug}#challenge-${entry.id}`);
    const problem = page.locator(`#challenge-${entry.id}`);
    await expect(problem).toHaveAttribute("data-problem-source", "textbook");
    await expect(problem.locator(".challenge-source")).toContainText(
      `习题${entry.exercise}`,
    );
    await expect(problem.locator(".challenge-source")).not.toContainText(
      "题干、数值和解答为本站原创",
    );
    expect(await problem.getByRole("img").count()).toBeGreaterThan(0);
    await problem.locator(".challenge-solution summary").click();
    await expect(problem.locator(".textbook-takeaway")).toContainText(
      "关键判断",
    );
    await expect(problem.locator(".katex-error")).toHaveCount(0);
  }
});
