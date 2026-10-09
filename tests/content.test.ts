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
import { textbookTopics } from "../src/lib/textbook-scope";
test("all registered lessons exist, contain eight sections and valid links", () => {
  const slugs = new Set(articles.map((a) => a.slug));
  assert.equal(slugs.size, 39);
  assert.equal(articles.filter((a) => a.core).length, 39);
  for (const article of articles) {
    assert.ok(Number.isInteger(lessonSections[article.slug]), article.slug);
    const body = fs.readFileSync(
      path.join("content", article.folder, article.slug + ".mdx"),
      "utf8",
    );
    sections.forEach((s, i) =>
      assert.ok(body.includes(`## ${i + 1}. ${s}`), article.slug + ": " + s),
    );
    for (const match of body.matchAll(/\/learn\/([a-z0-9-]+)/g))
      assert.ok(slugs.has(match[1]), match[0]);
  }
});

test("quick reference follows textbook sections and excludes removed topics", () => {
  assert.deepEqual(
    [...new Set(formulas.map((formula) => formula.position[0]))],
    [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12],
  );
  assert.equal(formulas[0].position[0], 1);
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
  assert.deepEqual(chapters[10].slugs, ["chapter-11-summary", "rlc"]);
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

test("every in-scope textbook section has concepts, formulas, examples and warnings", () => {
  assert.equal(textbookTopics.length, 54);
  assert.equal(
    new Set(textbookTopics.map((topic) => `${topic.chapter}-${topic.section}`))
      .size,
    54,
  );
  assert.deepEqual(
    textbookTopics
      .filter((topic) => topic.chapter === 4)
      .map((topic) => topic.section),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    textbookTopics
      .filter((topic) => topic.chapter === 7)
      .map((topic) => topic.section),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    textbookTopics
      .filter((topic) => topic.chapter === 11)
      .map((topic) => topic.section),
    [2, 4],
  );
  for (const topic of textbookTopics) {
    const article = articles.find((item) => item.slug === topic.slug)!;
    const body = fs.readFileSync(
      path.join("content", article.folder, article.slug + ".mdx"),
      "utf8",
    );
    const section = body
      .split(`id="${topic.anchor}"`)[1]
      ?.split("</section>")[0];
    assert.ok(section, topic.anchor);
    for (const text of [
      "概念与条件",
      "<Formula",
      "怎样使用",
      "代入示例",
      "<Warning>",
    ])
      assert.ok(section.includes(text), topic.anchor + " " + text);
  }
  const rl = formulas.find((formula) => formula.name === "RL 时间常数");
  assert.ok(rl?.latex.includes("L"));
  assert.deepEqual(rl?.position.slice(0, 2), [7, 2]);
  assert.ok(
    formulas.every(
      (formula) =>
        !(formula.position[0] === 4 && formula.position[1] > 4) &&
        !(formula.position[0] === 7 && formula.position[1] > 4),
    ),
  );
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

test("all MDX compiles and literal math renders in strict KaTeX mode", async () => {
  const { compile } = await import("@mdx-js/mdx");
  for (const article of articles) {
    const body = fs.readFileSync(
      path.join("content", article.folder, article.slug + ".mdx"),
      "utf8",
    );
    await assert.doesNotReject(() => compile(body), article.slug);
    for (const match of body.matchAll(
      /latex\s*=\s*\{\s*("(?:\\.|[^"\\])*")\s*\}/gs,
    )) {
      const latex = JSON.parse(match[1]) as string;
      assert.doesNotThrow(
        () =>
          katex.renderToString(latex, { throwOnError: true, strict: "error" }),
        article.slug + ": " + latex,
      );
    }
  }
});
