import { componentTerminals } from "./model";
import { componentAnnotations } from "./annotations";
import {
  BOARD,
  cleanPath,
  equalPoint,
  nextId,
  pointKey,
  snap,
  wireContains,
} from "./geometry";
import { detectTopology } from "./topology";
import type { CircuitDocument, PlacedComponent, Point } from "./types";

const directions: Point[] = [
  [20, 0],
  [0, 20],
  [-20, 0],
  [0, -20],
];
function cells(points: Point[]): Point[] {
  return points.slice(1).flatMap((b, i) => {
    const a = points[i],
      steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 20;
    return Array.from(
      { length: steps + 1 },
      (_, k) =>
        [
          a[0] + ((b[0] - a[0]) * k) / (steps || 1),
          a[1] + ((b[1] - a[1]) * k) / (steps || 1),
        ] as Point,
    );
  });
}
export function insideComponent(p: Point, c: PlacedComponent, padding = 0) {
  const vertical = c.rotation % 180 !== 0;
  return (
    Math.abs(p[0] - c.position[0]) < (vertical ? 19 : 39) + padding &&
    Math.abs(p[1] - c.position[1]) < (vertical ? 39 : 19) + padding
  );
}
/** Grid search penalizes bends and keeps existing corridors where possible. */
function route(
  start: Point,
  end: Point,
  blocked: Set<string>,
  preferred: Set<string>,
): Point[] {
  if (equalPoint(start, end)) return [start];
  type State = {
    p: Point;
    direction: number;
    cost: number;
    rank: number;
    parent?: State;
  };
  const first: State = { p: start, direction: -1, cost: 0, rank: 0 },
    open = [first],
    best = new Map<string, number>();
  const heuristic = (p: Point) =>
    (Math.abs(p[0] - end[0]) + Math.abs(p[1] - end[1])) / 20;
  while (open.length) {
    open.sort((a, b) => b.rank - a.rank);
    const current = open.pop()!;
    if (equalPoint(current.p, end)) {
      const result: Point[] = [];
      for (let s: State | undefined = current; s; s = s.parent)
        result.push(s.p);
      return cleanPath(result.reverse());
    }
    for (let d = 0; d < directions.length; d++) {
      const delta = directions[d],
        p: Point = [current.p[0] + delta[0], current.p[1] + delta[1]],
        key = pointKey(p);
      if (
        p[0] < 20 ||
        p[0] > BOARD.width - 20 ||
        p[1] < 20 ||
        p[1] > BOARD.height - 20 ||
        (blocked.has(key) && !equalPoint(p, end))
      )
        continue;
      const cost =
          current.cost +
          (preferred.has(key) ? 1 : 1.2) +
          (current.direction >= 0 && current.direction !== d ? 2.5 : 0),
        stateKey = `${key}:${d}`;
      if ((best.get(stateKey) ?? Infinity) <= cost) continue;
      best.set(stateKey, cost);
      open.push({
        p,
        direction: d,
        cost,
        rank: cost + heuristic(p),
        parent: current,
      });
    }
  }
  throw new Error(
    "当前位置没有可用的连线路径，请移到更宽敞的位置，或先删除导线再旋转。",
  );
}
function sameConnections(a: CircuitDocument, b: CircuitDocument) {
  const left = detectTopology(a).netlist.components.flatMap((c) => c.nodes),
    right = detectTopology(b).netlist.components.flatMap((c) => c.nodes);
  for (let i = 0; i < left.length; i++) {
    if (a.grounds.length && (left[i] === "N0") !== (right[i] === "N0"))
      return false;
    for (let j = 0; j < i; j++)
      if ((left[i] === left[j]) !== (right[i] === right[j])) return false;
  }
  return true;
}

/** Rebuild connected routes atomically. Old lead extensions are never accumulated. */
export function repositionComponent(
  doc: CircuitDocument,
  id: string,
  position: Point,
  rotation?: PlacedComponent["rotation"],
): CircuitDocument {
  const old = doc.components.find((c) => c.id === id);
  if (!old) return doc;
  const changed = {
    ...old,
    position: snap(position, 80),
    rotation: rotation ?? old.rotation,
  };
  if (
    equalPoint(old.position, changed.position) &&
    old.rotation === changed.rotation
  )
    return doc;
  if (
    doc.components.some(
      (c) =>
        c.id !== id &&
        Math.hypot(
          c.position[0] - changed.position[0],
          c.position[1] - changed.position[1],
        ) < 80,
    )
  )
    throw new Error("元件过于接近，已保留原位置。");
  const before = componentTerminals(old),
    after = componentTerminals(changed),
    topology = detectTopology(doc);
  const anchored = before.map(
    (pin) =>
      doc.components.some(
        (c) =>
          c.id !== id && componentTerminals(c).some((p) => equalPoint(p, pin)),
      ) ||
      doc.grounds.some((g) => equalPoint(g.position, pin)) ||
      doc.junctions.some((p) => equalPoint(p, pin)) ||
      doc.wires.some(
        (w) =>
          wireContains(w.points, pin) &&
          !equalPoint(w.points[0], pin) &&
          !equalPoint(w.points.at(-1)!, pin),
      ),
  );
  const replacements = new Map(
    before.flatMap((pin, i) =>
      anchored[i] ? [] : [[pointKey(pin), after[i]] as const],
    ),
  );
  const affected = doc.wires.filter(
    (w) =>
      replacements.has(pointKey(w.points[0])) ||
      replacements.has(pointKey(w.points.at(-1)!)),
  );
  const result: CircuitDocument = {
    ...doc,
    components: doc.components.map((c) => (c.id === id ? changed : c)),
    wires: doc.wires.filter((w) => !affected.includes(w)),
  };
  const tasks = affected.map((w) => ({
    ...w,
    net: topology.wireNodes[w.id],
    original: w.points,
  }));
  before.forEach((pin, i) => {
    if (anchored[i] && !equalPoint(pin, after[i])) {
      const wireId = nextId("W", [
        ...doc.wires.map((w) => w.id),
        ...tasks.map((w) => w.id),
      ]);
      tasks.push({
        id: wireId,
        points: [pin, after[i]],
        original: [pin, after[i]],
        net: topology.netlist.components.find((c) => c.id === id)!.nodes[i],
      });
    }
  });
  const componentPins = result.components.flatMap((c, i) =>
    componentTerminals(c).map((p, k) => ({
      p,
      c,
      net: topology.netlist.components[i].nodes[k],
    })),
  );
  const keep = [
    ...doc.junctions,
    ...doc.grounds.map((g) => g.position),
    ...doc.components.filter((c) => c.id !== id).flatMap(componentTerminals),
    ...doc.wires.flatMap((w) => [w.points[0], w.points.at(-1)!]),
  ].filter((p) => !replacements.has(pointKey(p)));
  for (const task of tasks) {
    const start = replacements.get(pointKey(task.points[0])) ?? task.points[0],
      end =
        replacements.get(pointKey(task.points.at(-1)!)) ?? task.points.at(-1)!;
    const anchors = [
      start,
      ...cells(task.original).filter(
        (p) =>
          !equalPoint(p, task.original[0]) &&
          !equalPoint(p, task.original.at(-1)!) &&
          keep.some((q) => equalPoint(p, q)),
      ),
      end,
    ];
    const unique = anchors.filter(
      (p, i) => !i || !equalPoint(p, anchors[i - 1]),
    );
    const blocked = new Set<string>();
    const annotationBoxes = result.components.flatMap(
      (c) => componentAnnotations(c).boxes,
    );
    for (let x = 20; x < BOARD.width; x += 20)
      for (let y = 20; y < BOARD.height; y += 20) {
        const p: Point = [x, y];
        if (
          result.components.some((c) => insideComponent(p, c)) ||
          annotationBoxes.some(
            (b) =>
              p[0] >= b.left &&
              p[0] <= b.right &&
              p[1] >= b.top &&
              p[1] <= b.bottom,
          )
        )
          blocked.add(pointKey(p));
      }
    for (const w of result.wires)
      if (
        (topology.wireNodes[w.id] ?? tasks.find((t) => t.id === w.id)?.net) !==
        task.net
      )
        cells(w.points).forEach((p) => blocked.add(pointKey(p)));
    componentPins
      .filter((p) => p.net !== task.net)
      .forEach((p) => blocked.add(pointKey(p.p)));
    const preferred = new Set(cells(task.original).map(pointKey)),
      path: Point[] = [];
    for (let i = 1; i < unique.length; i++) {
      const a = unique[i - 1],
        b = unique[i];
      const exit = (p: Point) => {
        const terminal = componentPins.find((t) => equalPoint(t.p, p));
        return terminal
          ? ([
              p[0] + (p[0] - terminal.c.position[0]) / 2,
              p[1] + (p[1] - terminal.c.position[1]) / 2,
            ] as Point)
          : p;
      };
      const aExit = exit(a),
        bExit = exit(b);
      if (
        (blocked.has(pointKey(aExit)) && !equalPoint(aExit, b)) ||
        (blocked.has(pointKey(bExit)) && !equalPoint(bExit, a))
      )
        throw new Error(
          "旋转后的端子会碰到其他节点，已保留原电路。请先移动元件。",
        );
      path.push(a, ...route(aExit, bExit, blocked, preferred), b);
    }
    result.wires.push({ id: task.id, points: cleanPath(path) });
  }
  if (
    result.wires.some((w) =>
      cells(w.points).some((p) =>
        result.components.some((c) => insideComponent(p, c)),
      ),
    )
  )
    throw new Error(
      "线路会穿过元件，已保留原电路。请移动到空白位置或调整导线。",
    );
  if (!sameConnections(doc, result))
    throw new Error("该操作会改变节点连接，已保留原电路。请先调整导线。");
  return result;
}

/** The reference tool replaces the old marker; its contact must be a real conductor. */
export function setReferenceGround(
  doc: CircuitDocument,
  point: Point,
): CircuitDocument {
  const p = snap(point);
  if (
    doc.components.some((c) => insideComponent(p, c)) ||
    (!doc.components.some((c) =>
      componentTerminals(c).some((q) => equalPoint(p, q)),
    ) &&
      !doc.wires.some((w) => wireContains(w.points, p)))
  )
    throw new Error(
      "请把参考地放在元件端子或导线上，不能放在元件内部或空白处。",
    );
  const ungrounded = detectTopology({ ...doc, grounds: [] });
  const contacts = new Set(
    doc.wires
      .filter((w) => wireContains(w.points, p))
      .map((w) => ungrounded.wireNodes[w.id]),
  );
  if (contacts.size > 1)
    throw new Error(
      "这里是未连接的交叉线，请先添加连接点，或在单根导线上设置参考地。",
    );
  return { ...doc, grounds: [{ id: doc.grounds[0]?.id ?? "G1", position: p }] };
}
