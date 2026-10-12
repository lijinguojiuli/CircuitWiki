import { test, expect } from "@playwright/test";
import steps from "../../src/lib/challenges/worked-solutions.json";
import { challengeIndex } from "../../src/lib/challenges/catalogue";

test("illustrated solutions show one figure per detailed operation", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const [id, solution] of Object.entries(steps)) {
    const example = id.startsWith("example-");
    const slug = example
      ? (
          {
            "example-thevenin-divider": "thevenin",
            "example-source-transform": "source-transformations",
            "example-bridge-port": "bridge-arm",
          } as Record<string, string>
        )[id]
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
      await expect(step.getByRole("img")).toHaveCount(1);
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
