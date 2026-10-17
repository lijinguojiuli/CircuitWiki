import { componentTerminals, formatComponentValue } from "./model";
import { equalPoint, onSegment } from "./geometry";
import type { CircuitDocument, PlacedComponent, Point } from "./types";
export type Box = { left: number; right: number; top: number; bottom: number };
export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
export function crossesBox(a: Point, b: Point, box: Box) {
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
    if (!p) {
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
type Label = { x: number; y: number; anchor: "start" | "end" | "middle" };
function textBox(p: Label, width: number, height = 20): Box {
  const left =
    p.x - (p.anchor === "middle" ? width / 2 : p.anchor === "end" ? width : 0);
  return {
    left: left - 3,
    right: left + width + 3,
    top: p.y - height + 3,
    bottom: p.y + 5,
  };
}
/** All text stays upright; vertical sources follow textbook left-name/right-value notation. */
export function componentAnnotations(c: PlacedComponent) {
  const [x, y] = c.position,
    vertical = c.rotation % 180 !== 0,
    source = c.type !== "resistor";
  const id: Label =
    source && vertical
      ? { x: x - 52, y: y + 5, anchor: "end" }
      : vertical
        ? {
            x: x + (x > 800 ? -47 : 47),
            y: y - 4,
            anchor: x > 800 ? "end" : "start",
          }
        : { x, y: y - (source ? 49 : 34), anchor: "middle" };
  const value: Label =
    source && vertical
      ? { x: x + 52, y: y + 5, anchor: "start" }
      : vertical
        ? { ...id, y: y + 17 }
        : { x, y: y + 53, anchor: "middle" };
  const inlineValue = !source && !vertical;
  const polarity = componentTerminals(c).map(([px, py], i) => ({
    x: vertical ? x + 29 : px < x ? x - 29 : x + 29,
    y: vertical ? (py < y ? y - 25 : y + 37) : y - 12,
    sign: i ? "−" : "+",
  }));
  const boxes: Box[] = [
    {
      left: x - (vertical ? 20 : 30),
      right: x + (vertical ? 20 : 30),
      top: y - (vertical ? 30 : 20),
      bottom: y + (vertical ? 30 : 20),
    },
    textBox(
      id,
      c.id.length * 10 +
        (inlineValue ? formatComponentValue(c).length * 7 + 17 : 0),
    ),
  ];
  // Reserve the selection outline too, so selecting a symbol cannot obscure a node label.
  const outlineX = vertical ? (source ? 23 : 23) : 57;
  const outlineY = vertical ? 57 : source ? 35 : 23;
  boxes.push({
    left: x - outlineX,
    right: x + outlineX,
    top: y - outlineY,
    bottom: y + outlineY,
  });
  if (!inlineValue)
    boxes.push(textBox(value, formatComponentValue(c).length * 7, 15));
  if (c.type === "voltage-source")
    polarity.forEach((p) =>
      boxes.push(textBox({ ...p, anchor: "middle" }, 13)),
    );
  else
    boxes.push(
      vertical
        ? { left: x - 38, right: x + 38, top: y - 20, bottom: y + 20 }
        : { left: x - 20, right: x + 20, top: y - 36, bottom: y + 36 },
    );
  return { id, value, inlineValue, polarity, boxes };
}
function wireConflict(a: Point, b: Point, c: Point, d: Point, contact: Point) {
  const av = a[0] === b[0],
    cv = c[0] === d[0];
  if (av === cv) {
    if (av ? a[0] !== c[0] : a[1] !== c[1]) return false;
    const axis = av ? 1 : 0;
    return (
      Math.min(Math.max(a[axis], b[axis]), Math.max(c[axis], d[axis])) -
        Math.max(Math.min(a[axis], b[axis]), Math.min(c[axis], d[axis])) >
      1
    );
  }
  const p: Point = av ? [a[0], c[1]] : [c[0], a[1]];
  return !equalPoint(p, contact) && onSegment(p, a, b) && onSegment(p, c, d);
}
/** The electrical contact remains at g.position; only its annotation is offset. */
export function groundAnnotations(doc: CircuitDocument) {
  const segments = [
    ...doc.wires.flatMap((w) =>
      w.points.slice(1).map((p, i) => [w.points[i], p] as const),
    ),
    ...doc.components.map(componentTerminals),
  ];
  const occupied = doc.components.flatMap((c) => componentAnnotations(c).boxes);
  return doc.grounds.map((g) => {
    const [x, y] = g.position;
    const paths: Point[][] = [[g.position]];
    for (const dx of [60, -60, 100, -100]) {
      paths.push([g.position, [x + dx, y], [x + dx, y + 20]]);
      for (const dy of [-80, 60, -120, 100])
        paths.push([
          g.position,
          [x, y + dy],
          [x + dx, y + dy],
          [x + dx, y + dy + 20],
        ]);
    }
    const candidates = paths
      .map((points) => {
        const p = points.at(-1)!,
          label: Label = {
            x: p[0] + (p[0] > 900 ? -45 : 45),
            y: p[1] + 21,
            anchor: p[0] > 900 ? "end" : "start",
          };
        const boxes: Box[] = [
          {
            left: p[0] - 18,
            right: p[0] + 18,
            top: p[1] + 8,
            bottom: p[1] + 29,
          },
          textBox(label, 24, 15),
        ];
        const leaders = points.slice(1).map((q, i) => [points[i], q] as const);
        const conflicts =
          boxes.reduce(
            (sum, b) =>
              sum +
              occupied.filter((o) => overlaps(o, b)).length +
              segments.filter(([a, z]) => crossesBox(a, z, b)).length,
            0,
          ) +
          leaders.reduce(
            (sum, [a, b]) =>
              sum +
              segments.filter(([c, d]) => wireConflict(a, b, c, d, g.position))
                .length +
              occupied.filter((o) => crossesBox(a, b, o)).length,
            0,
          );
        const selfConflicts = leaders.reduce(
          (sum, [a, b]) =>
            sum + boxes.filter((box) => crossesBox(a, b, box)).length,
          0,
        );
        const inBounds =
          boxes.every(
            (b) =>
              b.left >= 3 && b.right <= 997 && b.top >= 3 && b.bottom <= 637,
          ) &&
          points.every(
            (p) => p[0] >= 0 && p[0] <= 1000 && p[1] >= 0 && p[1] <= 640,
          );
        return {
          id: g.id,
          contact: g.position,
          position: p,
          points,
          label,
          boxes,
          score:
            (inBounds ? 0 : 100000) +
            (conflicts + selfConflicts) * 1000 +
            points.reduce(
              (sum, q, i) =>
                sum +
                (i
                  ? Math.abs(q[0] - points[i - 1][0]) +
                    Math.abs(q[1] - points[i - 1][1])
                  : 0),
              0,
            ),
        };
      })
      .sort((a, b) => a.score - b.score);
    const chosen = candidates[0];
    occupied.push(...chosen.boxes);
    chosen.points
      .slice(1)
      .forEach((p, i) => segments.push([chosen.points[i], p]));
    return chosen;
  });
}
