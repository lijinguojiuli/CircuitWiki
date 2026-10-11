import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import {
  challenges,
  originalChallenges,
  textbookChallenges,
} from "../src/lib/challenges";
import { checkResiduals } from "../src/lib/challenges/verify";
import { articles, curriculumArticles } from "../src/lib/content";
import { textbookTopics } from "../src/lib/textbook-scope";

test("all 53 studied sections own a complete independent page and original challenge", () => {
  assert.equal(curriculumArticles.length, 53);
  assert.equal(originalChallenges.length, 53);
  assert.equal(new Set(textbookTopics.map((topic) => topic.slug)).size, 53);
  assert.ok(
    articles.every(
      (article) =>
        !article.slug.startsWith("chapter-") && !article.title.includes("全览"),
    ),
  );
  for (const topic of textbookTopics) {
    const id = `${topic.chapter}-${topic.section}`;
    const article = articles.find((item) => item.slug === topic.slug)!;
    const body = fs.readFileSync(
      path.join("content", article.folder, article.slug + ".mdx"),
      "utf8",
    );
    assert.ok(body.includes(`id="${topic.anchor}"`), id);
    assert.ok(body.includes(`<ChallengeProblem id="${id}" />`), id);
    assert.ok(!body.includes("全览"), `${id}: aggregate entry remains in body`);
    const problem = challenges.find((item) => item.id === id)!;
    assert.ok(
      problem &&
        problem.tasks.length >= 3 &&
        problem.hints.length >= 2 &&
        problem.steps.length >= 3 &&
        problem.checks.length >= 1,
      id,
    );
  }
});
test("all textbook and original answers satisfy independent numerical checks", () => {
  for (const problem of challenges)
    for (const check of problem.checks) {
      const residuals = checkResiduals(check);
      assert.ok(residuals.length > 0, problem.id);
      for (const residual of residuals)
        assert.ok(
          Number.isFinite(residual) && Math.abs(residual) < 1e-8,
          `${problem.id} ${check.kind}: residual ${residual}`,
        );
    }
});
test("all challenge steps and final answers render in strict KaTeX", () => {
  for (const problem of challenges)
    for (const latex of [
      problem.answer,
      ...problem.steps.map((step) => step.latex),
    ])
      assert.doesNotThrow(
        () =>
          katex.renderToString(latex, { throwOnError: true, strict: "error" }),
        `${problem.id}: ${latex}`,
      );
});
test("problem circuit graphs have valid terminals and textbook source/resistor symbol kinds", () => {
  const kinds = new Set([
    "resistor",
    "impedance",
    "voltage",
    "current",
    "controlled-current",
    "capacitor",
    "inductor",
  ]);
  for (const problem of challenges)
    for (const network of [
      problem.network,
      ...(problem.networks?.map((item) => item.network) ?? []),
    ].filter((item) => item !== null)) {
      const nodes = new Set(network.nodes.map((node) => node.id));
      for (const branch of network.branches)
        assert.ok(
          nodes.has(branch.from) &&
            nodes.has(branch.to) &&
            kinds.has(branch.kind),
          problem.id,
        );
      if (network.ground) assert.ok(nodes.has(network.ground), problem.id);
    }
});

test("selected textbook exercises retain provenance, diagrams, tasks and learning takeaways", () => {
  assert.equal(textbookChallenges.length, 10);
  assert.equal(new Set(challenges.map((problem) => problem.id)).size, 63);
  for (const problem of textbookChallenges) {
    assert.ok(problem.source?.exercise && problem.source.pages, problem.id);
    assert.ok(problem.network || problem.networks?.length, problem.id);
    assert.ok(
      problem.tasks.length >= 2 &&
        problem.steps.length >= 3 &&
        problem.takeaway,
      problem.id,
    );
  }
});
