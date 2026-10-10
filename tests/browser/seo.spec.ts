import { test, expect } from "@playwright/test";
test("canonical, sharing, sitemap and private-page indexing are consistent", async ({
  page,
  request,
}) => {
  for (const route of [
    "/",
    "/knowledge",
    "/curriculum",
    "/paths",
    "/paths/foundations",
    "/graph",
    "/learn/nodal-analysis",
    "/formulas",
    "/tools",
    "/me",
    "/search",
  ]) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://circuit-wiki.vercel.app${route === "/" ? "" : route}`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /CircuitWiki/,
    );
    await expect(
      page.locator('meta[property="og:image"]').first(),
    ).toHaveAttribute("content", /opengraph-image/);
    if (["/me", "/search"].includes(route))
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
  }
  await page.goto("/learn/nodal-analysis");
  const data = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.map((element) => JSON.parse(element.textContent!)),
    );
  expect(data.map((item) => item["@type"])).toEqual(
    expect.arrayContaining(["LearningResource", "BreadcrumbList"]),
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("/learn/nodal-analysis");
  expect(xml).not.toContain("/me</loc>");
  expect(xml).not.toContain("/search</loc>");
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});
