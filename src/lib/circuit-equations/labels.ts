import { componentTerminals } from "./model";
import {
  componentAnnotations,
  groundAnnotations,
  overlaps as overlap,
  crossesBox as crosses,
  type Box,
} from "./annotations";
import type { CircuitDocument, Point } from "./types";
import type { Topology } from "./topology";
/** Place automatic node labels in free space; electrical coordinates remain unchanged. */
export function nodeLabelPositions(doc: CircuitDocument, topology: Topology) {
  const boxes: Box[] = [],
    segments = doc.wires.flatMap((w) =>
      w.points.slice(1).map((p, i) => [w.points[i], p] as const),
    );
  for (const c of doc.components) {
    segments.push(componentTerminals(c));
    boxes.push(...componentAnnotations(c).boxes);
  }
  for (const g of groundAnnotations(doc)) {
    boxes.push(...g.boxes);
    g.points.slice(1).forEach((p, i) => segments.push([g.points[i], p]));
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
