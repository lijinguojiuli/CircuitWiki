import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { workedSolutions } from "../src/lib/challenges";
import type { ProblemNetwork } from "../src/lib/challenges/types";

test("worked solutions pair each operation with one valid figure and detailed reasoning", () => {
  assert.equal(Object.keys(workedSolutions).length, 25);
  assert.equal(Object.values(workedSolutions).flat().length, 121);
  for (const [id, steps] of Object.entries(workedSolutions))
    for (const step of steps) {
      assert.ok(
        step.action &&
          step.reasoning &&
          step.reasoning.length >= 2 &&
          step.check,
        `${id}: missing instruction or check`,
      );
      assert.ok(step.figure, id);
      assert.doesNotThrow(
        () =>
          katex.renderToString(step.latex, {
            strict: "error",
            throwOnError: true,
          }),
        `${id}: ${step.latex}`,
      );
      if (step.figure.kind === "circuit") {
        const n = step.figure.network,
          ids = new Set(n.nodes.map((node) => node.id));
        assert.equal(ids.size, n.nodes.length, id);
        for (const b of n.branches)
          assert.ok(ids.has(b.from) && ids.has(b.to) && b.from !== b.to, id);
        assert.ok(
          n.nodes.every((node) =>
            n.branches.some(
              (branch) => branch.from === node.id || branch.to === node.id,
            ),
          ),
          `${id}: obsolete internal node`,
        );
        for (const index of n.emphasis ?? [])
          assert.ok(index >= 0 && index < n.branches.length, id);
      } else if (step.figure.kind === "plot") {
        assert.ok(step.figure.series.length <= 2, id);
        for (const s of step.figure.series) {
          assert.ok(s.points.length > 2, id);
          s.points.forEach(([x, y], i) => {
            assert.ok(Number.isFinite(x) && Number.isFinite(y), id);
            if (i) assert.ok(x > s.points[i - 1][0], id);
          });
        }
      }
    }
});

function voltage(network: ProblemNetwork, terminal: string) {
  const parent = new Map(network.nodes.map((n) => [n.id, n.id]));
  const root = (id: string): string =>
    parent.get(id) === id ? id : root(parent.get(id)!);
  for (const b of network.branches)
    if (b.kind === "wire") parent.set(root(b.from), root(b.to));
  const ground = root(network.ground ?? "b");
  const nodes = [...new Set(network.nodes.map((n) => root(n.id)))].filter(
    (n) => n !== ground,
  );
  const sources = network.branches.filter((b) => b.kind === "voltage");
  const size = nodes.length + sources.length;
  const matrix = Array.from(
    { length: size },
    () => Array(size + 1).fill(0) as number[],
  );
  const idx = (id: string) => nodes.indexOf(root(id));
  const value = (label: string) => {
    const m = label.match(/(-?\d+(?:\.\d+)?)(?:\/(\d+))?\s*(kΩ|Ω|mA|A|V)/);
    assert.ok(m, `Cannot read numeric circuit label: ${label}`);
    return (
      (Number(m[1]) / (Number(m[2]) || 1)) *
      (m[3] === "kΩ" ? 1000 : m[3] === "mA" ? 0.001 : 1)
    );
  };
  for (const b of network.branches) {
    const a = idx(b.from),
      c = idx(b.to);
    if (b.kind === "resistor") {
      const g = 1 / value(b.label);
      if (a >= 0) matrix[a][a] += g;
      if (c >= 0) matrix[c][c] += g;
      if (a >= 0 && c >= 0) {
        matrix[a][c] -= g;
        matrix[c][a] -= g;
      }
    }
    if (b.kind === "current") {
      const i = value(b.label);
      if (a >= 0) matrix[a][size] -= i;
      if (c >= 0) matrix[c][size] += i;
    }
    if (b.kind === "controlled-current") {
      assert.ok(
        b.label.startsWith("0.25 mS"),
        "test solver requires the stated S-A control relation",
      );
      const plus = idx("S"),
        minus = idx("A"),
        g = 0.00025;
      if (a >= 0) {
        if (plus >= 0) matrix[a][plus] += g;
        if (minus >= 0) matrix[a][minus] -= g;
      }
      if (c >= 0) {
        if (plus >= 0) matrix[c][plus] -= g;
        if (minus >= 0) matrix[c][minus] += g;
      }
    }
    if (b.kind === "voltage") {
      const row = nodes.length + sources.indexOf(b);
      if (a >= 0) {
        matrix[a][row] += 1;
        matrix[row][a] += 1;
      }
      if (c >= 0) {
        matrix[c][row] -= 1;
        matrix[row][c] -= 1;
      }
      matrix[row][size] = value(b.label);
    }
  }
  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let r = col + 1; r < size; r++)
      if (Math.abs(matrix[r][col]) > Math.abs(matrix[pivot][col])) pivot = r;
    assert.ok(Math.abs(matrix[pivot][col]) > 1e-12, "singular test circuit");
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    const factor = matrix[col][col];
    for (let j = col; j <= size; j++) matrix[col][j] /= factor;
    for (let r = 0; r < size; r++)
      if (r !== col) {
        const f = matrix[r][col];
        for (let j = col; j <= size; j++) matrix[r][j] -= f * matrix[col][j];
      }
  }
  return idx(terminal) < 0 ? 0 : matrix[idx(terminal)][size];
}

test("numeric source transformations and negative-polarity equivalents preserve actual terminal voltages", () => {
  for (const [id, index, terminal, expected] of [
    ["2-3", 1, "A", 120 / 17],
    ["book-fig-4-7", 1, "A", 8],
    ["2-4", 0, "A", 48 / 7],
    ["2-4", 0, "B", 36 / 7],
    ["4-3", 0, "a", 15],
    ["4-3", 2, "a", 1],
    ["4-3", 3, "a", 0],
    ["4-3", 5, "a", 15],
    ["4-3", 6, "a", 9],
    ["4-3", 7, "a", 9],
    ["2-6", 0, "A", 16],
    ["2-6", 1, "a", 16],
    ["2-6", 2, "a", 16],
    ["2-6", 3, "a", 32 / 3],
    ["2-6", 4, "A", 32 / 3],
    ["book-2-7", 0, "A", 12],
    ["book-2-7", 1, "a", 12],
    ["book-2-7", 2, "a", 12],
    ["book-2-7", 3, "a", 4],
    ["book-2-7", 4, "A", 4],
    ["book-4-9-a", 0, "a", -0.5],
    ["book-4-9-a", 6, "a", -0.5],
    ["book-4-9-a", 7, "a", -0.5],
    ["example-thevenin-divider", 1, "a", 8],
    ["example-thevenin-divider", 4, "a", 0],
    ["example-thevenin-divider", 6, "a", 8],
    ["example-thevenin-divider", 7, "a", 4.8],
    ["example-bridge-port", 0, "a", 14],
    ["example-bridge-port", 1, "a", 0],
    ["example-bridge-port", 3, "A", 14],
    ["example-bridge-port", 4, "a", 14],
    ["example-bridge-port", 5, "a", 8.4],
    ["example-bridge-port", 6, "a", 8.4],
  ] as const) {
    const fig = workedSolutions[id][index].figure!;
    assert.equal(fig.kind, "circuit");
    if (fig.kind === "circuit")
      assert.ok(
        Math.abs(voltage(fig.network, terminal) - expected) < 1e-8,
        `${id} step ${index + 1}`,
      );
  }
});

test("storage-energy plots retain the internal state energy omitted by port equivalence", () => {
  for (const [id, expected] of [
    ["book-6-9", 45],
    ["book-6-10", 15],
  ] as const) {
    const figure = workedSolutions[id][3].figure!;
    assert.equal(figure.kind, "plot");
    if (figure.kind === "plot")
      for (let i = 0; i < figure.series[0].points.length; i++) {
        assert.ok(
          Math.abs(
            figure.series[0].points[i][1] -
              figure.series[1].points[i][1] -
              expected,
          ) < 1e-8,
          id,
        );
      }
  }
});
