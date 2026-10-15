import { componentTerminals, formatComponentValue } from "./model";
import type { CircuitDocument, Point } from "./types";
import type { Topology } from "./topology";
type Box = { left: number; right: number; top: number; bottom: number };
const overlap = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
function crosses(a: Point, b: Point, box: Box) {
  let lo = 0,
    hi = 1;
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
    } else {
      const t = q / p;
      if (p < 0) lo = Math.max(lo, t);
      else hi = Math.min(hi, t);
      if (lo > hi) return false;
    }
  }
  return true;
}
/** Place automatic node labels in free space; electrical coordinates remain unchanged. */
export function nodeLabelPositions(doc: CircuitDocument, topology: Topology) {
  const boxes: Box[] = [],
    segments = doc.wires.flatMap((w) =>
      w.points.slice(1).map((p, i) => [w.points[i], p] as const),
    );
  for (const c of doc.components) {
    const [x, y] = c.position,
      vertical = c.rotation === 90 || c.rotation === 270;
    segments.push(componentTerminals(c));
    boxes.push({
      left: x - (vertical ? 22 : 30),
      right: x + (vertical ? 22 : 30),
      top: y - (vertical ? 30 : 22),
      bottom: y + (vertical ? 30 : 22),
    });
    if (vertical) {
      const length =
        Math.max(c.id.length * 10, formatComponentValue(c).length * 7) + 6;
      boxes.push({
        left: x > 800 ? x - 47 - length : x + 43,
        right: x > 800 ? x - 43 : x + 47 + length,
        top: y - 26,
        bottom: y + 24,
      });
    } else {
      const width = c.id.length * 10 + formatComponentValue(c).length * 7 + 20;
      boxes.push({
        left: x - width / 2,
        right: x + width / 2,
        top: y - 54,
        bottom: y - 28,
      });
    }
    if (c.type === "voltage-source")
      boxes.push(
        vertical
          ? { left: x - 43, right: x - 20, top: y - 30, bottom: y + 27 }
          : { left: x - 44, right: x + 44, top: y + 20, bottom: y + 49 },
      );
    else
      boxes.push(
        vertical
          ? { left: x - 37, right: x - 22, top: y - 20, bottom: y + 20 }
          : { left: x - 20, right: x + 20, top: y + 22, bottom: y + 36 },
      );
  }
  for (const g of doc.grounds) {
    const [x, y] = g.position;
    boxes.push(
      { left: x - 20, right: x + 20, top: y, bottom: y + 29 },
      {
        left: x > 900 ? x - 70 : x + 42,
        right: x > 900 ? x - 42 : x + 74,
        top: y + 5,
        bottom: y + 27,
      },
    );
  }
  return topology.positions.flatMap((n) => {
    const [x, y] = n.position,
      width = n.id.length * 10 + 6;
    const offsets: Point[] = [
      [0, -20],
      [-26, -20],
      [26, -20],
      [-28, 7],
      [28, 7],
      [0, 34],
      [-30, 34],
      [30, 34],
      [-55, -25],
      [55, -25],
      [0, -55],
      [0, 60],
      [-80, 8],
      [80, 8],
    ];
    for (const [dx, dy] of offsets) {
      const p: Point = [x + dx, y + dy],
        box = {
          left: p[0] - width / 2,
          right: p[0] + width / 2,
          top: p[1] - 19,
          bottom: p[1] + 5,
        };
      if (
        box.left < 6 ||
        box.right > 994 ||
        box.top < 6 ||
        box.bottom > 634 ||
        boxes.some((b) => overlap(b, box)) ||
        segments.some(([a, b]) => crosses(a, b, box))
      )
        continue;
      boxes.push(box);
      return [{ id: n.id, position: p }];
    }
    return [];
  });
}
