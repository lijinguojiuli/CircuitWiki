import type { ComplexPair, ProblemCheck } from "./types";
const multiply = ([a, b]: ComplexPair, [c, d]: ComplexPair): ComplexPair => [
  a * c - b * d,
  a * d + b * c,
];
export function checkResiduals(check: ProblemCheck): number[] {
  switch (check.kind) {
    case "polar": {
      const angle = (check.angleDegrees * Math.PI) / 180;
      return [
        check.magnitude * Math.cos(angle) - check.real,
        check.magnitude * Math.sin(angle) - check.imag,
      ];
    }
    case "topology": {
      const nodes = [...new Set(check.edges.flat())];
      const visited = new Set<string>();
      const walk = (node: string) => {
        if (visited.has(node)) return;
        visited.add(node);
        for (const [a, b] of check.edges) {
          if (a === node) walk(b);
          if (b === node) walk(a);
        }
      };
      walk(nodes[0]);
      return [
        nodes.length - check.expectedNodes,
        check.edges.length - check.expectedBranches,
        nodes.length - 1 - check.expectedKCL,
        check.edges.length - nodes.length + 1 - check.expectedKVL,
        visited.size - nodes.length,
      ];
    }
    case "exponentialIntegral":
      return [
        (check.amplitude / check.rate) *
          (1 - Math.exp(-check.rate * check.time)) -
          check.expected,
      ];
    case "equivalentNetwork": {
      // Apply a unit port voltage and solve all internal nodes independently.
      const [positive, negative] = check.terminals;
      const nodes = [
        ...new Set(
          check.branches.flatMap((branch) => [branch.from, branch.to]),
        ),
      ].filter((node) => node !== positive && node !== negative);
      const matrix = nodes.map(() => nodes.map(() => 0));
      const rhs = nodes.map(() => 0);
      const weight = (value: number) =>
        check.family === "C" ? value : 1 / value;
      for (const branch of check.branches) {
        for (const [from, to] of [
          [branch.from, branch.to],
          [branch.to, branch.from],
        ]) {
          const index = nodes.indexOf(from);
          if (index < 0) continue;
          const w = weight(branch.value);
          matrix[index][index] += w;
          if (to === positive) rhs[index] += w;
          else if (to !== negative) matrix[index][nodes.indexOf(to)] -= w;
        }
      }
      const rows = matrix.map((row, index) => [...row, rhs[index]]);
      for (let k = 0; k < nodes.length; k++) {
        let pivot = k;
        for (let i = k + 1; i < nodes.length; i++)
          if (Math.abs(rows[i][k]) > Math.abs(rows[pivot][k])) pivot = i;
        [rows[k], rows[pivot]] = [rows[pivot], rows[k]];
        const divisor = rows[k][k];
        if (Math.abs(divisor) < 1e-15) return [NaN];
        rows[k] = rows[k].map((value) => value / divisor);
        for (let i = 0; i < nodes.length; i++)
          if (i !== k) {
            const factor = rows[i][k];
            rows[i] = rows[i].map((value, j) => value - factor * rows[k][j]);
          }
      }
      const potential = (node: string) =>
        node === positive
          ? 1
          : node === negative
            ? 0
            : rows[nodes.indexOf(node)][nodes.length];
      const flow = check.branches.reduce(
        (sum, branch) =>
          sum +
          (branch.from === positive
            ? weight(branch.value) * (1 - potential(branch.to))
            : branch.to === positive
              ? weight(branch.value) * (1 - potential(branch.from))
              : 0),
        0,
      );
      return [
        ((check.family === "C" ? flow : 1 / flow) - check.expected) /
          Math.max(1e-12, Math.abs(check.expected)),
      ];
    }
    case "linear":
      return check.matrix.map(
        (row, i) =>
          row.reduce(
            (total, value, j) => total + value * check.solution[j],
            0,
          ) - check.rhs[i],
      );
    case "complexLinear":
      return check.matrix.flatMap((row, i) => {
        const result = row.reduce<ComplexPair>(
          (sum, value, j) => {
            const product = multiply(value, check.solution[j]);
            return [sum[0] + product[0], sum[1] + product[1]];
          },
          [0, 0],
        );
        return [result[0] - check.rhs[i][0], result[1] - check.rhs[i][1]];
      });
    case "power":
      return [
        check.terms.reduce((sum, [a, b]) => sum + a * b, 0) - check.expected,
      ];
    case "number":
      return [check.actual - check.expected];
    case "polynomial":
      return [
        check.coefficients.reduce(
          (sum, value, index) => sum + value * check.x ** index,
          0,
        ) - check.expected,
      ];
    case "integral":
      return [
        check.intervals.reduce(
          (sum, interval) =>
            sum +
            interval.coefficients.reduce(
              (part, coefficient, index) =>
                part +
                (coefficient / (index + 1)) *
                  (interval.to ** (index + 1) - interval.from ** (index + 1)),
              0,
            ),
          0,
        ) - check.expected,
      ];
    case "capacitorEnergy":
      return [0.5 * check.capacitance * check.voltage ** 2 - check.expected];
    case "inductorEnergy":
      return [0.5 * check.inductance * check.current ** 2 - check.expected];
    case "coupledEnergy":
      return [
        0.5 * check.L1 * check.i1 ** 2 +
          0.5 * check.L2 * check.i2 ** 2 +
          check.M * check.i1 * check.i2 -
          check.expected,
      ];
    case "transient":
      return [
        check.final +
          (check.initial - check.final) * Math.exp(-check.time / check.tau) -
          check.expected,
      ];
    case "delta": {
      const [a, b, c] = check.delta;
      const sum = a + b + c;
      return [
        (a * c) / sum - check.star[0],
        (a * b) / sum - check.star[1],
        (b * c) / sum - check.star[2],
      ];
    }
    case "acPower": {
      const [u, v] = check.voltage;
      const [i, j] = check.current;
      const n = check.multiplier ?? 1;
      return [
        n * (u * i + v * j) - check.expectedP,
        n * (v * i - u * j) - check.expectedQ,
      ];
    }
    case "resonance":
      return [check.omega ** 2 * check.L * check.C - 1];
    case "graph":
      return check.cycles.flatMap((cycle) =>
        check.nodes.map((node) =>
          check.edges.reduce(
            (sum, [from, to], index) =>
              sum +
              (from === node ? -cycle[index] : to === node ? cycle[index] : 0),
            0,
          ),
        ),
      );
  }
}
