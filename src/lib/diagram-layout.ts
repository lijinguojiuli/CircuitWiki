import type { ProblemNetwork } from "./challenges/types";

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
