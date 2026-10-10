import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { articles, sections } from "../src/lib/content";
import {
  chapters,
  chapterForArticle,
  lessonSections,
  learningChapters,
} from "../src/lib/chapters";
import { formulas } from "../src/lib/formulas";
import katex from "katex";
import { textbookTopics } from "../src/lib/textbook-scope";
test("all registered lessons exist, contain eight sections and valid links", () => {
  const slugs = new Set(articles.map((a) => a.slug));
  assert.equal(slugs.size, 40);
  assert.equal(articles.filter((a) => a.core).length, 40);
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

test("formula symbols name their quantities and navigation contains learning content", () => {
  assert.deepEqual(
    learningChapters.map((chapter) => chapter.number),
    [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12],
  );
  assert.equal(
    articles.find((article) => article.slug === "thevenin")?.title,
    "戴维宁定理",
  );
  assert.equal(chapterForArticle("input-resistance").number, 2);
  const resistors = formulas.find(
    (formula) => formula.name === "电阻的串联和并联关系",
  )!;
  assert.ok(
    resistors.parameters.some(
      (note) => note.includes("Rk") && note.includes("编号"),
    ),
  );
  const input = formulas.find(
    (formula) => formula.name === "输入电阻测试源法",
  )!;
  assert.equal(input.slug, "input-resistance");
  assert.ok(
    input.parameters.some(
      (note) => note.includes("Req") && note.includes("端口"),
    ),
  );
  assert.ok(
    formulas.every(
      (formula) =>
        formula.parameters.length > 0 && !formula.condition.includes("戴维南"),
    ),
  );
});

test("time constants use Req and transformer reference keeps only the ideal model", () => {
  const rc = formulas.find((formula) => formula.name === "RC 时间常数")!;
  const rl = formulas.find((formula) => formula.name === "RL 时间常数")!;
  assert.equal(rc.latex, "\\tau=R_{eq}C");
  assert.equal(rl.latex, "\\tau=\\frac{L}{R_{eq}}");
  assert.ok(!formulas.some((formula) => formula.name === "变压器原理关系"));
  assert.ok(formulas.some((formula) => formula.name === "理想变压器关系"));
  assert.ok(
    !textbookTopics.some(
      (topic) => topic.chapter === 10 && topic.section === 4,
    ),
  );
  assert.deepEqual(
    formulas
      .filter((formula) => formula.emphasis === "secondary")
      .map((formula) => formula.name),
    ["并联电容补偿", "中性点位移"],
  );
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
  before("电压源、电流源的串联和并联关系", "电压源并联电流源");
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
  assert.equal(textbookTopics.length, 53);
  assert.equal(
    new Set(textbookTopics.map((topic) => `${topic.chapter}-${topic.section}`))
      .size,
    53,
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
