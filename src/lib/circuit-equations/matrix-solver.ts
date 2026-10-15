export type EliminationStep = {
  column: number;
  pivotRow: number;
  matrix: number[][];
  rhs: number[];
  description: string;
};
export type LinearResult = (
  | { status: "unique"; values: number[]; residual: number }
  | { status: "inconsistent" | "underdetermined" | "ill-conditioned" }
) & { steps: EliminationStep[]; rowScale: number[]; columnScale: number[] };
/** Row and column equilibration avoids treating SI-scale conductances as zero. */
export function solveMatrix(A: number[][], b: number[]): LinearResult {
  const n = A.length;
  if (
    !n ||
    n > 100 ||
    b.length !== n ||
    A.some((row) => row.length !== n) ||
    ![...A.flat(), ...b].every(Number.isFinite)
  )
    throw new Error("矩阵维数或数值无效。");
  const rowScale = A.map(
    (row, i) => Math.max(...row.map(Math.abs), Math.abs(b[i])) || 1,
  );
  const rows = A.map((row, i) => row.map((v) => v / rowScale[i]));
  const rhs = b.map((v, i) => v / rowScale[i]);
  const columns = Array.from(
    { length: n },
    (_, j) => Math.max(...rows.map((row) => Math.abs(row[j]))) || 1,
  );
  const m = rows.map((row, i) => [
      ...row.map((v, j) => v / columns[j]),
      rhs[i],
    ]),
    steps: EliminationStep[] = [];
  let rank = 0;
  const pivots: number[] = [];
  for (let col = 0; col < n; col++) {
    let p = rank;
    for (let r = rank + 1; r < n; r++)
      if (Math.abs(m[r][col]) > Math.abs(m[p][col])) p = r;
    if (rank >= n || Math.abs(m[p][col]) < 1e-12) continue;
    [m[p], m[rank]] = [m[rank], m[p]];
    const pivot = m[rank][col];
    for (let j = col; j <= n; j++) m[rank][j] /= pivot;
    for (let r = rank + 1; r < n; r++) {
      const f = m[r][col];
      for (let j = col; j <= n; j++) m[r][j] -= f * m[rank][j];
    }
    pivots.push(col);
    steps.push({
      column: col,
      pivotRow: p,
      matrix: m.map((row) => row.slice(0, n)),
      rhs: m.map((row) => row[n]),
      description: `第${col + 1}列选取绝对值最大的可用主元${p !== rank ? `，交换第${rank + 1}、${p + 1}行` : ""}，再消去其下方系数。`,
    });
    rank++;
  }
  const detail = { steps, rowScale, columnScale: columns };
  for (let r = rank; r < n; r++)
    if (
      m[r].slice(0, n).every((v) => Math.abs(v) < 1e-10) &&
      Math.abs(m[r][n]) > 1e-9
    )
      return { status: "inconsistent", ...detail };
  if (rank < n) return { status: "underdetermined", ...detail };
  const y = Array(n).fill(0) as number[];
  for (let r = n - 1; r >= 0; r--) {
    const col = pivots[r];
    y[col] =
      m[r][n] -
      m[r].slice(col + 1, n).reduce((sum, v, k) => sum + v * y[col + 1 + k], 0);
  }
  const values = y.map((v, i) => v / columns[i]);
  if (!values.every(Number.isFinite))
    return { status: "ill-conditioned", ...detail };
  const residual = Math.max(
    ...A.map(
      (row, i) =>
        Math.abs(row.reduce((sum, v, j) => sum + v * values[j], 0) - b[i]) /
        (row.reduce((sum, v, j) => sum + Math.abs(v * values[j]), 0) +
          Math.abs(b[i]) +
          1e-30),
    ),
  );
  return !Number.isFinite(residual) || residual > 1e-7
    ? { status: "ill-conditioned", ...detail }
    : { status: "unique", values, residual, ...detail };
}
