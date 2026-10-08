import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { articles, sections } from "../src/lib/content";
import { formulas } from "../src/lib/formulas";
import katex from "katex";
test("all registered lessons exist, contain eight sections and valid links", () => {
  const slugs = new Set(articles.map((a) => a.slug));
  assert.equal(slugs.size, 16);
  assert.equal(articles.filter((a) => a.core).length, 6);
  for (const article of articles) {
    const body = fs.readFileSync(
      path.join("content", article.folder, article.slug + ".mdx"),
      "utf8",
    );
    sections.forEach((s, i) =>
      assert.ok(body.includes(`## ${i + 1}. ${s}`), article.slug + ": " + s),
    );
    for (const match of body.matchAll(/\/learn\/([a-z-]+)/g))
      assert.ok(slugs.has(match[1]), match[0]);
  }
});
test("formula catalog renders without KaTeX errors and links to valid lessons", () => {
  for (const formula of formulas) {
    assert.ok(articles.some((a) => a.slug === formula.slug));
    assert.doesNotThrow(() =>
      katex.renderToString(formula.latex, {
        throwOnError: true,
        strict: "error",
      }),
    );
  }
});
