import { test, expect } from "@playwright/test";
import { textbookTopics } from "../../src/lib/textbook-scope";

test("all 53 in-scope sections have live anchors and rendered instructional content", async ({
  page,
}) => {
  for (const chapter of [
    ...new Set(textbookTopics.map((topic) => topic.chapter)),
  ]) {
    await page.goto(`/learn/chapter-${chapter}-summary`);
    const topics = textbookTopics.filter((topic) => topic.chapter === chapter);
    await expect(page.locator(".textbook-topic")).toHaveCount(topics.length);
    for (const topic of topics) {
      const block = page.locator(`#${topic.anchor}`);
      await expect(block.locator("h3")).toContainText(topic.title);
      expect(await block.locator(".katex").count()).toBeGreaterThan(0);
      await expect(block).toContainText("代入示例");
      await expect(block.locator(".warning")).toHaveCount(1);
    }
  }
  await page.goto("/curriculum");
  await expect(page.locator("h1")).toContainText("按教材章节学习");
  await expect(page.locator(".coverage-grid a")).toHaveCount(53);
  await page.locator("#chapter-7 .coverage-detail summary").click();
  await page.locator('a[href="/learn/chapter-7-summary#textbook-7-2"]').click();
  await expect(page).toHaveURL(/#textbook-7-2$/);
  await expect(page.locator("#textbook-7-2")).toBeInViewport();
});

test("sine calculations, phasor construction and Y-delta comparison respond to input", async ({
  page,
}) => {
  await page.goto("/learn/sinusoidal");
  const sine = page.locator(".sinusoidal-lab");
  await sine.getByLabel("正弦电压峰值").fill(String(10 * Math.sqrt(2)));
  await sine.getByLabel("初相位 φ").fill("-30");
  await sine.getByLabel("求值时刻 t").fill("5");
  await expect(sine.locator(".port-results")).toContainText(
    "u(5 ms)=7.07107 V",
  );
  await sine.getByLabel("频率 f").fill("0");
  await expect(sine.getByRole("alert")).toContainText("频率须为正");
  await page.goto("/learn/phasor-diagrams");
  const drawing = page.locator(".phasor-construction");
  await drawing.getByRole("button", { name: "容性：RC", exact: true }).click();
  await expect(drawing.locator(".port-results")).toContainText("50∠-53.1301°");
  await drawing.getByLabel("相量画图步骤").focus();
  await page.keyboard.press("Home");
  await expect(drawing.getByRole("img")).toHaveAttribute("aria-label", /第1步/);
  await page.keyboard.press("End");
  await drawing.getByRole("button", { name: "谐振：RLC", exact: true }).click();
  await expect(drawing.locator(".port-results")).toContainText("30∠0°");
  await page.goto("/learn/line-phase");
  const three = page.locator(".three-phase-lab");
  await expect(three.locator(".port-results")).toContainText(
    "线电流：7.3131 A",
  );
  await three.getByRole("button", { name: "Δ 三角形", exact: true }).click();
  await expect(three.locator(".port-results")).toContainText(
    "线电流：21.9393 A",
  );
  await expect(three.getByRole("img")).toHaveAttribute(
    "aria-label",
    "三相星形电源连接三角形负载",
  );
  await three.getByLabel("每相阻抗模").fill("0");
  await expect(three.getByRole("alert")).toContainText("阻抗须为正数");
});
