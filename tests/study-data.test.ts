import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyStudy,
  mergeStudy,
  normalizeStudy,
  parseStudyImport,
} from "../src/lib/study-data";
import { learningAssistantContext } from "../src/lib/assistant-contract";
import { searchContent } from "../src/lib/search";
test("legacy learning data migrates without losing completed articles", () => {
  const migrated = normalizeStudy({
    completed: ["kcl-kvl", "kcl-kvl", "missing"],
    lastSlug: "nodal-analysis",
  });
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.completed, ["kcl-kvl"]);
  assert.equal(migrated.lastSlug, "nodal-analysis");
  assert.deepEqual(migrated.bookmarks, []);
});
test("history normalization rejects invalid entries and clamps reading progress", () => {
  const state = normalizeStudy({
    completed: [],
    history: [
      { slug: "rc-circuit", visitedAt: "2026-10-10T00:00:00Z", progress: 110 },
      { slug: "missing", visitedAt: "2026-10-10T00:00:00Z" },
      { slug: "phasor", visitedAt: "invalid" },
    ],
  });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].progress, 100);
  assert.equal(state.lastSlug, "rc-circuit");
});
test("import validates data and merges rather than discarding existing learning", () => {
  assert.throws(() => parseStudyImport("not-json"));
  assert.throws(() => parseStudyImport('{"something":true}'));
  assert.throws(() => parseStudyImport('{"version":99,"completed":[]}'));
  assert.throws(() => parseStudyImport(" ".repeat(1_000_001)));
  const existing = {
    ...emptyStudy,
    completed: ["kcl-kvl"],
    bookmarks: ["phasor"],
  };
  const incoming = parseStudyImport(
    '{"version":2,"completed":["rc-circuit"],"bookmarks":["phasor","thevenin"]}',
  );
  const merged = mergeStudy(existing, incoming);
  assert.deepEqual(merged.completed, ["kcl-kvl", "rc-circuit"]);
  assert.deepEqual(merged.bookmarks, ["phasor", "thevenin"]);
});
test("complete search filters by type and knowledge category", () => {
  const formulas = searchContent("", Infinity, {
    kind: "公式",
    area: "dynamics",
  });
  assert.ok(
    formulas.length > 0 &&
      formulas.every(
        (result) => result.kind === "公式" && result.area === "dynamics",
      ),
  );
  assert.ok(searchContent("", Infinity).length > 100);
  assert.ok(
    searchContent("电容", Infinity).length >= searchContent("电容").length,
  );
});

test("history merge preserves the latest visit and furthest reading independently", () => {
  const current = normalizeStudy({
    completed: [],
    history: [
      { slug: "rc-circuit", visitedAt: "2026-10-10T12:00:00Z", progress: 20 },
    ],
  });
  const older = normalizeStudy({
    completed: [],
    history: [
      { slug: "rc-circuit", visitedAt: "2026-10-09T12:00:00Z", progress: 90 },
    ],
  });
  const merged = mergeStudy(current, older);
  assert.equal(merged.history[0].visitedAt, "2026-10-10T12:00:00Z");
  assert.equal(merged.history[0].progress, 90);
});
test("reserved assistant context contains verifiable lesson and formula sources", () => {
  const context = learningAssistantContext("rc-circuit")!;
  assert.ok(context.source.section.includes("7-"));
  assert.ok(context.formulas.some((formula) => formula.name === "RC 时间常数"));
  assert.equal(learningAssistantContext("missing"), null);
});
