import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { articles, sections } from "../src/lib/content";
import {
  chapters,
  chapterForArticle,
  lessonSections,
} from "../src/lib/chapters";
import { formulas } from "../src/lib/formulas";
import katex from "katex";
test("all registered lessons exist, contain eight sections and valid links", () => {
  const slugs = new Set(articles.map((a) => a.slug));
  assert.equal(slugs.size, 26);
  assert.equal(articles.filter((a) => a.core).length, 16);
  for (const article of articles) {
    assert.ok(Number.isInteger(lessonSections[article.slug]), article.slug);
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

test("quick reference follows textbook sections and excludes removed topics", () => {
  assert.deepEqual(
    [...new Set(formulas.map((formula) => formula.position[0]))],
    [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12],
  );
  assert.equal(formulas[0].name, "瞬时功率");
  const names = formulas.map((formula) => formula.name);
  const before = (first: string, second: string) => {
    assert.ok(names.includes(first) && names.includes(second));
    assert.ok(
      names.indexOf(first) < names.indexOf(second),
      `${first} should precede ${second}`,
    );
  };
  before("三角形转星形", "对称星三角变换");
  before("电感储能", "RC 时间常数");
  before("有功功率", "耦合因数");
  before("耦合因数", "RLC串联谐振频率");
  before("中性点位移", "三相有功功率");
  assert.ok(formulas.every((formula) => formula.slug !== "controlled-sources"));
  assert.ok(formulas.every((formula) => !/二瓦|两瓦/.test(formula.name)));
  for (const article of articles) {
    assert.ok(
      !/二瓦|两瓦/.test(
        `${article.title} ${article.description} ${article.keywords.join(" ")}`,
      ),
    );
    const body = fs.readFileSync(
      path.join("content", article.folder, `${article.slug}.mdx`),
      "utf8",
    );
    assert.ok(!/二瓦|两瓦/.test(body), article.slug);
  }
});

test("textbook chapters preserve numbering, skip chapter 5 and restrict chapter 11 to resonance", () => {
  assert.deepEqual(
    chapters.map((chapter) => chapter.number),
    Array.from({ length: 12 }, (_, i) => i + 1),
  );
  assert.equal(chapters[4].skipped, true);
  assert.deepEqual(chapters[4].slugs, []);
  assert.deepEqual(chapters[10].slugs, ["rlc"]);
  const assigned = chapters.flatMap((chapter) => chapter.slugs);
  assert.equal(new Set(assigned).size, assigned.length);
  assert.deepEqual(
    assigned,
    articles.map((article) => article.slug),
  );
  for (const chapter of chapters.filter((item) => !item.skipped))
    assert.ok(chapter.slugs.length > 0);
  assert.equal(chapterForArticle("rc-circuit").number, 7);
  assert.equal(chapterForArticle("phasor").number, 8);
  assert.equal(chapterForArticle("impedance").number, 9);
  assert.equal(chapterForArticle("coupled-inductors").number, 10);
  assert.equal(chapterForArticle("rlc").number, 11);
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
