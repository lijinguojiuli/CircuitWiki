import { test, expect } from "@playwright/test";
import steps from "../../src/lib/challenges/worked-solutions.json";
import { challengeIndex } from "../../src/lib/challenges/catalogue";
import examples from "../../src/lib/challenges/worked-example-index.json";

test("every problem and inline example renders detailed steps with the intended figures", async ({
  page,
}) => {
  test.setTimeout(360000);
  for (const [id, solution] of Object.entries(steps)) {
    const example = id.startsWith("example-");
    const slug = example
      ? (examples as Record<string, { slug: string }>)[id].slug
      : challengeIndex.find((item) => item.id === id)!.slug;
    await page.goto(`/learn/${slug}`);
    const scope = page.locator(
      example
        ? `[data-worked-example="${id}"]`
        : `#challenge-${id} .challenge-solution`,
    );
    if (!example) await scope.locator("summary").click();
    await expect(scope.locator("[data-worked-step]")).toHaveCount(
      solution.length,
    );
    for (let i = 0; i < solution.length; i++) {
      const step = scope.locator("[data-worked-step]").nth(i);
      await expect(step.getByRole("img")).toHaveCount(
        "figure" in solution[i] ? 1 : 0,
      );
      await expect(step.locator(".worked-step-action")).toContainText(
        "本步操作",
      );
      expect(
        await step.locator(".worked-step-reasoning li").count(),
      ).toBeGreaterThanOrEqual(2);
      await expect(step.locator(".worked-step-check")).toContainText("检查");
      await expect(step.locator(".katex-error")).toHaveCount(0);
    }
  }
});
