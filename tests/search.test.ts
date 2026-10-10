import test from "node:test";
import assert from "node:assert/strict";
import { searchContent, formulaId } from "../src/lib/search";
import { formulas } from "../src/lib/formulas";
import { learningStages, stageLessons } from "../src/lib/learning";
import { articles } from "../src/lib/content";
import { learningChapters } from "../src/lib/chapters";

test("stages cover exactly the existing chapters and preserve lesson order", () => {
  assert.deepEqual(
    learningStages.flatMap((stage) => [...stage.chapters]),
    learningChapters.map((chapter) => chapter.number),
  );
  assert.deepEqual(
    learningStages.flatMap((stage) =>
      stageLessons(stage.chapters).map((article) => article.slug),
    ),
    articles.map((article) => article.slug),
  );
});
test("search ranks dedicated lessons and can locate sections, formulas and tools", () => {
  assert.equal(searchContent("戴维宁")[0].href, "/learn/thevenin");
  assert.ok(
    searchContent("替代定理").some((result) =>
      result.href.includes("#textbook-4-2"),
    ),
  );
  assert.equal(searchContent("RC 时间常数")[0].kind, "公式");
  assert.equal(searchContent("RC 计算器")[0].href, "/tools#rc");
  assert.ok(searchContent("tau").some((result) => result.kind === "公式"));
  assert.deepEqual(searchContent("二瓦计"), []);
});
test("formula search targets are unique and map back to catalog positions", () => {
  assert.equal(new Set(formulas.map(formulaId)).size, formulas.length);
  for (const formula of formulas)
    assert.match(formulaId(formula), /^formula-\d+-\d+-\d+$/);
});
