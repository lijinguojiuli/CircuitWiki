import type { ComplexPair, ProblemCheck } from "./types";
const multiply = ([a, b]: ComplexPair, [c, d]: ComplexPair): ComplexPair => [
  a * c - b * d,
  a * d + b * c,
];
export function checkResiduals(check: ProblemCheck): number[] {
  switch (check.kind) {
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
