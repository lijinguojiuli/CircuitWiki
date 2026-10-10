import test from "node:test";
import assert from "node:assert/strict";
import { articles } from "../src/lib/content";
import {
  areaForArticle,
  articlesInArea,
  knowledgeAreas,
  knowledgeRelations,
  prerequisitesFor,
} from "../src/lib/knowledge";
import { learningPaths } from "../src/lib/paths";
test("knowledge taxonomy covers all real articles once", () => {
  assert.deepEqual(
    knowledgeAreas
      .flatMap((area) => articlesInArea(area.id).map((article) => article.slug))
      .sort(),
    articles.map((article) => article.slug).sort(),
  );
  for (const article of articles) assert.ok(areaForArticle(article.slug));
});
test("prerequisites are valid, acyclic and generate reverse relationships", () => {
  const valid = new Set(articles.map((article) => article.slug));
  const visit = (slug: string, stack: Set<string>) => {
    assert.ok(!stack.has(slug), `Dependency cycle: ${slug}`);
    const next = new Set([...stack, slug]);
    for (const prerequisite of prerequisitesFor(slug)) {
      assert.ok(valid.has(prerequisite), prerequisite);
      assert.ok(knowledgeRelations(prerequisite).subsequent.includes(slug));
      visit(prerequisite, next);
    }
    const relation = knowledgeRelations(slug);
    for (const other of relation.related)
      assert.ok(valid.has(other) && other !== slug);
  };
  for (const article of articles) visit(article.slug, new Set());
});
test("paths contain real unique articles in textbook order", () => {
  for (const path of learningPaths) {
    assert.equal(new Set(path.slugs).size, path.slugs.length);
    const positions = path.slugs.map((slug) =>
      articles.findIndex((article) => article.slug === slug),
    );
    assert.ok(positions.every((position) => position >= 0));
    assert.deepEqual(
      positions,
      [...positions].sort((a, b) => a - b),
    );
  }
});
