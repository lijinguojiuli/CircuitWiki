import type { ProblemNetwork, ProblemPhasors } from "./challenges/types";

type Point = [number, number];
type Box = { left: number; right: number; top: number; bottom: number };

function crossesBox(a: Point, b: Point, box: Box) {
  let start = 0,
    end = 1;
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  for (const [p, q] of [
    [-dx, a[0] - box.left],
    [dx, box.right - a[0]],
    [-dy, a[1] - box.top],
    [dy, box.bottom - a[1]],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const ratio = q / p;
    if (p < 0) start = Math.max(start, ratio);
    else end = Math.min(end, ratio);
    if (start > end) return false;
  }
  return true;
}

/** Allocate clear label positions for both origin-based and head-to-tail vectors. */
export function phasorLabelPositions(
  group: ProblemPhasors,
  scale: number,
): Point[] {
  const vectors = group.vectors.filter(
    (v) => Math.hypot(v.real, v.imag) * scale > 1e-6,
  );
  const segments = vectors.map((v) => ({
    a: [
      180 + scale * (v.start?.[0] ?? 0),
      170 - scale * (v.start?.[1] ?? 0),
    ] as Point,
    b: [
      180 + scale * (v.real + (v.start?.[0] ?? 0)),
      170 - scale * (v.imag + (v.start?.[1] ?? 0)),
    ] as Point,
  }));
  segments.push(
    { a: [30, 170], b: [370, 170] },
    { a: [180, 25], b: [180, 315] },
  );
  const occupied: Box[] = [
    { left: 348, right: 372, top: 175, bottom: 194 },
    { left: 148, right: 172, top: 5, bottom: 24 },
  ];
  return vectors.map((v, i) => {
    const end = segments[i].b,
      start = segments[i].a;
    const width =
      [...v.label].reduce(
        (sum, c) => sum + (/[\u2e80-\u9fff]/.test(c) ? 14 : 8),
        0,
      ) + 8;
    const offsets: Point[] = [
      v.labelOffset ?? [v.real < 0 ? -22 : 22, v.imag < 0 ? 24 : -16],
    ];
    for (const radius of [24, 40, 58, 78])
      for (const [dx, dy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        offsets.push([dx * radius, dy * radius]);
    const candidates = offsets.map(
      ([dx, dy]) => [end[0] + dx, end[1] + dy] as Point,
    );
    for (const t of [0.5, 0.25, 0.75])
      for (const side of [-1, 1]) {
        const len = Math.hypot(end[0] - start[0], end[1] - start[1]);
        candidates.push([
          start[0] +
            (end[0] - start[0]) * t -
            (side * (end[1] - start[1]) * 25) / len,
          start[1] +
            (end[1] - start[1]) * t +
            (side * (end[0] - start[0]) * 25) / len,
        ]);
      }
    const bounds = ([x, y]: Point): Box => ({
      left: x - width / 2,
      right: x + width / 2,
      top: y - 17,
      bottom: y + 5,
    });
    const score = (p: Point) => {
      const b = bounds(p);
      let value = 0;
      if (b.left < 5 || b.right > 395 || b.top < 5 || b.bottom > 335)
        value += 1000;
      value += segments.filter((s) => crossesBox(s.a, s.b, b)).length * 20;
      value +=
        occupied.filter(
          (a) =>
            b.left < a.right + 3 &&
            b.right > a.left - 3 &&
            b.top < a.bottom + 3 &&
            b.bottom > a.top - 3,
        ).length * 40;
      return value;
    };
    const selected = candidates.reduce((best, p) =>
      score(p) < score(best) ? p : best,
    );
    occupied.push(bounds(selected));
    return selected;
  });
}

/** Keep node names beside clear space, rather than on an incident vertical wire. */
export function networkNodeLabelOffset(
  network: ProblemNetwork,
  node: ProblemNetwork["nodes"][number],
): Point {
  if (node.labelOffset) return node.labelOffset;
  const segments = network.branches.flatMap((branch) => {
    const from = network.nodes.find((item) => item.id === branch.from)!;
    const to = network.nodes.find((item) => item.id === branch.to)!;
    const points: Point[] = [
      [from.x, from.y],
      ...(branch.via ?? []),
      [to.x, to.y],
    ];
    return points.slice(1).map((point, i) => ({
      a: points[i],
      b: point,
      branch,
    }));
  });
  const width = Math.max(14, node.id.length * 10);
  const candidates: Point[] = [
    [0, -16],
    [-24, -16],
    [24, -16],
    [-24, 5],
    [24, 5],
    [0, 30],
    [-24, 28],
    [24, 28],
    [-38, 5],
    [38, 5],
  ];
  const score = ([dx, dy]: Point) => {
    const box = {
      left: node.x + dx - width / 2 - 3,
      right: node.x + dx + width / 2 + 3,
      top: node.y + dy - 18,
      bottom: node.y + dy + 5,
    };
    let collisions = segments.filter((segment) =>
      crossesBox(segment.a, segment.b, box),
    ).length;
    for (const branch of network.branches) {
      if (branch.kind === "wire") continue;
      const options = segments.filter((segment) => segment.branch === branch);
      const symbol =
        branch.symbolSegment === undefined
          ? options.reduce((best, item) =>
              Math.hypot(item.b[0] - item.a[0], item.b[1] - item.a[1]) >
              Math.hypot(best.b[0] - best.a[0], best.b[1] - best.a[1])
                ? item
                : best,
            )
          : options[branch.symbolSegment];
      const x = (symbol.a[0] + symbol.b[0]) / 2,
        y = (symbol.a[1] + symbol.b[1]) / 2;
      if (
        box.left < x + 29 &&
        box.right > x - 29 &&
        box.top < y + 29 &&
        box.bottom > y - 29
      )
        collisions += 2;
    }
    if (box.left < 8 || box.right > 752 || box.top < 8 || box.bottom > 382)
      collisions += 10;
    return collisions;
  };
  return candidates.reduce((best, candidate) =>
    score(candidate) < score(best) ? candidate : best,
  );
}
