import {
  componentAnnotations,
  crossesBox,
  groundAnnotations,
  type Box,
} from "./annotations";
import { componentTerminals } from "./model";
import { equalPoint, onSegment, pointKey, wireContains } from "./geometry";
import type { CircuitDocument, CircuitNetlist, Point } from "./types";

export type PhysicalEdge = {
  a: string;
  b: string;
  from: Point;
  to: Point;
  component: number | null;
};
export type Topology = {
  netlist: CircuitNetlist;
  positions: { id: string; position: Point }[];
  junctions: Point[];
  warnings: string[];
  errors: string[];
  referenceReason: string;
  edges: PhysicalEdge[];
  crossings: Point[];
  loopCount: number;
  wireNodes: Record<string, string>;
  annotationBoxes: Box[];
};
class Union {
  parent = new Map<string, string>();
  root(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    const p = this.parent.get(x)!;
    if (p !== x) this.parent.set(x, this.root(p));
    return this.parent.get(x)!;
  }
  join(a: string, b: string) {
    const ra = this.root(a),
      rb = this.root(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }
}
export function detectTopology(doc: CircuitDocument): Topology {
  const u = new Union(),
    warnings: string[] = [],
    errors: string[] = [];
  const pins = doc.components.flatMap((c, i) =>
    componentTerminals(c).map((p, t) => ({
      key: `p${i}:${t}`,
      point: p,
      component: i,
      terminal: t,
    })),
  );
  const wires = doc.wires.map((w, i) => ({ ...w, key: `w${i}` }));
  for (const p of pins) {
    u.root(p.key);
    for (const q of pins)
      if (equalPoint(p.point, q.point)) u.join(p.key, q.key);
    for (const w of wires)
      if (wireContains(w.points, p.point)) u.join(p.key, w.key);
  }
  const taps = [
    ...pins.map((p) => p.point),
    ...doc.junctions,
    ...doc.grounds.map((g) => g.position),
    ...wires.flatMap((w) => [w.points[0], w.points.at(-1)!]),
  ];
  for (const w of wires) {
    u.root(w.key);
    for (const v of wires) {
      if (w === v) continue;
      if (
        taps.some((p) => wireContains(w.points, p) && wireContains(v.points, p))
      )
        u.join(w.key, v.key);
      for (let i = 1; i < w.points.length; i++)
        for (let j = 1; j < v.points.length; j++) {
          const a = w.points[i - 1],
            b = w.points[i],
            c = v.points[j - 1],
            d = v.points[j];
          if (
            a[0] === b[0] &&
            c[0] === d[0] &&
            a[0] === c[0] &&
            Math.min(Math.max(a[1], b[1]), Math.max(c[1], d[1])) >
              Math.max(Math.min(a[1], b[1]), Math.min(c[1], d[1]))
          )
            u.join(w.key, v.key);
          if (
            a[1] === b[1] &&
            c[1] === d[1] &&
            a[1] === c[1] &&
            Math.min(Math.max(a[0], b[0]), Math.max(c[0], d[0])) >
              Math.max(Math.min(a[0], b[0]), Math.min(c[0], d[0]))
          )
            u.join(w.key, v.key);
        }
    }
  }
  for (const c of doc.components) {
    const body = componentAnnotations(c).boxes[0];
    if (
      doc.wires.some((w) =>
        w.points.slice(1).some((p, i) => crossesBox(w.points[i], p, body)),
      )
    )
      errors.push(
        `导线穿过${c.id}符号，连接可能冲突。请绕开元件绘制导线，或重新载入示例。`,
      );
  }
  const grounded: string[] = [];
  for (const g of doc.grounds) {
    const keys = [
      ...pins.filter((p) => equalPoint(p.point, g.position)).map((p) => p.key),
      ...wires
        .filter((w) => wireContains(w.points, g.position))
        .map((w) => w.key),
    ];
    if (!keys.length) {
      errors.push(`${g.id}尚未接到端子或导线。`);
      continue;
    }
    keys.forEach((k) => u.join(keys[0], k));
    grounded.push(keys[0]);
  }
  grounded.forEach((k) => u.join(grounded[0], k));
  const groups = new Map<string, { pins: typeof pins; points: Point[] }>();
  for (const p of pins) {
    const root = u.root(p.key);
    if (!groups.has(root)) groups.set(root, { pins: [], points: [] });
    groups.get(root)!.pins.push(p);
    groups.get(root)!.points.push(p.point);
  }
  for (const w of wires) {
    const group = groups.get(u.root(w.key));
    if (group) group.points.push(...w.points);
    else warnings.push(`${w.id}未连接任何元件。`);
  }
  const roots = [...groups.keys()];
  let ref = grounded[0] ? u.root(grounded[0]) : undefined;
  if (ref && !groups.has(ref)) {
    errors.push("参考地没有连接到元件所在的电路。");
    ref = undefined;
  }
  const ordered = roots.sort((a, b) => {
    const ap = groups.get(a)!.points,
      bp = groups.get(b)!.points;
    return (
      Math.min(...ap.map((p) => p[0])) - Math.min(...bp.map((p) => p[0])) ||
      Math.min(...ap.map((p) => p[1])) - Math.min(...bp.map((p) => p[1]))
    );
  });
  if (!ref)
    ref = [...ordered].sort(
      (a, b) =>
        groups.get(b)!.pins.length - groups.get(a)!.pins.length ||
        Math.max(...groups.get(b)!.points.map((p) => p[1])) -
          Math.max(...groups.get(a)!.points.map((p) => p[1])),
    )[0];
  const ids = new Map<string, string>();
  if (ref) ids.set(ref, "N0");
  ordered.filter((r) => r !== ref).forEach((r, i) => ids.set(r, `N${i + 1}`));
  const components = doc.components.map((c, i) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    value: c.value,
    nodes: [ids.get(u.root(`p${i}:0`))!, ids.get(u.root(`p${i}:1`))!] as const,
  }));
  const nodes = [...ids.values()]
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((id) => ({ id, label: id }));
  const netlist: CircuitNetlist = {
    version: 1,
    nodes,
    referenceNodeId: ref ? "N0" : null,
    components,
  };
  if (components.length) {
    const seen = new Set<string>();
    const visit = (n: string) => {
      if (seen.has(n)) return;
      seen.add(n);
      components
        .filter((c) => c.nodes.includes(n))
        .forEach((c) => c.nodes.forEach(visit));
    };
    visit("N0");
    if (seen.size !== nodes.length)
      errors.push(
        "存在未接入主电路的独立子电路。请连接导线，或为各子电路接入共同参考地。",
      );
  }
  for (const p of pins)
    if (
      !wires.some((w) => wireContains(w.points, p.point)) &&
      !pins.some((q) => q !== p && equalPoint(q.point, p.point)) &&
      !doc.grounds.some((g) => equalPoint(g.position, p.point))
    )
      warnings.push(
        `${doc.components[p.component].id}端子${p.terminal + 1}悬空；它按开路端处理。`,
      );
  const positions = [...ids].map(([root, id]) => {
    const g = groups.get(root)!;
    const marker = doc.grounds.find(
      (p) =>
        g.points.some((q) => equalPoint(p.position, q)) ||
        wires.some(
          (w) => u.root(w.key) === root && wireContains(w.points, p.position),
        ),
    );
    const candidates = doc.junctions.filter(
      (p) =>
        g.points.some((q) => equalPoint(p, q)) ||
        wires.some((w) => u.root(w.key) === root && wireContains(w.points, p)),
    );
    const position =
      marker?.position ??
      candidates[0] ??
      g.points
        .filter((p) => !pins.some((q) => equalPoint(p, q.point)))
        .sort((a, b) => a[1] - b[1] || a[0] - b[0])[0] ??
      g.points[0];
    return { id, position };
  });
  const edges: PhysicalEdge[] = [],
    edgeKeys = new Set<string>();
  const vertex = (root: string, p: Point) => `${root}|${pointKey(p)}`;
  for (const w of wires) {
    const root = u.root(w.key);
    if (!groups.has(root)) continue;
    for (let i = 1; i < w.points.length; i++) {
      const a = w.points[i - 1],
        b = w.points[i];
      if (equalPoint(a, b)) continue;
      const candidates = [
        a,
        b,
        ...taps,
        ...wires.filter((v) => u.root(v.key) === root).flatMap((v) => v.points),
      ].filter((p) => onSegment(p, a, b));
      const unique = [
        ...new Map(candidates.map((p) => [pointKey(p), p])).values(),
      ].sort(
        (p, q) =>
          (p[0] - a[0]) * (b[0] - a[0]) +
          (p[1] - a[1]) * (b[1] - a[1]) -
          ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])),
      );
      for (let j = 1; j < unique.length; j++) {
        const from = unique[j - 1],
          to = unique[j],
          va = vertex(root, from),
          vb = vertex(root, to),
          key = [va, vb].sort().join(";");
        if (!edgeKeys.has(key)) {
          edges.push({ a: va, b: vb, from, to, component: null });
          edgeKeys.add(key);
        }
      }
    }
  }
  doc.components.forEach((c, i) => {
    const [a, b] = componentTerminals(c);
    edges.push({
      a: vertex(u.root(`p${i}:0`), a),
      b: vertex(u.root(`p${i}:1`), b),
      from: a,
      to: b,
      component: i,
    });
  });
  const crossings: Point[] = [];
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i],
        b = edges[j];
      const av = a.from[0] === a.to[0],
        bv = b.from[0] === b.to[0];
      if (av === bv) {
        if (a.component !== null || b.component !== null) {
          const collinear = av
            ? a.from[0] === b.from[0]
            : a.from[1] === b.from[1];
          const axis = av ? 1 : 0;
          if (
            collinear &&
            Math.min(
              Math.max(a.from[axis], a.to[axis]),
              Math.max(b.from[axis], b.to[axis]),
            ) >
              Math.max(
                Math.min(a.from[axis], a.to[axis]),
                Math.min(b.from[axis], b.to[axis]),
              )
          )
            crossings.push(a.from);
        }
        continue;
      }
      const p: Point = av ? [a.from[0], b.from[1]] : [b.from[0], a.from[1]];
      if (
        onSegment(p, a.from, a.to) &&
        onSegment(p, b.from, b.to) &&
        ![a.a, a.b].some((v) => v === b.a || v === b.b)
      )
        crossings.push(p);
    }
  const junctions = [
    ...new Map(
      edges
        .flatMap((e) => [e.from, e.to])
        .filter(
          (p) =>
            edges.filter((e) => equalPoint(e.from, p) || equalPoint(e.to, p))
              .length >= 3,
        )
        .map((p) => [pointKey(p), p]),
    ).values(),
  ];
  return {
    netlist,
    positions,
    junctions,
    warnings: [...new Set(warnings)],
    errors,
    referenceReason: grounded.length
      ? "采用画板中的接地标记作为 N0；所有接地标记共享 0 V 参考。"
      : "未放置接地，自动选择连接端子最多的节点为 N0；并列时优先下方节点。选择电位参考不会改变支路电压、电流。",
    edges,
    crossings: [...new Map(crossings.map((p) => [pointKey(p), p])).values()],
    loopCount: Math.max(0, components.length - nodes.length + 1),
    annotationBoxes: [
      ...doc.components.flatMap((c) => componentAnnotations(c).boxes),
      ...groundAnnotations(doc).flatMap((g) => g.boxes),
    ],
    wireNodes: Object.fromEntries(
      wires.map((w) => [
        w.id,
        ids.get(u.root(w.key)) ?? `wire:${u.root(w.key)}`,
      ]),
    ),
  };
}

export type Mesh = {
  name: string;
  coefficients: number[];
  center: Point;
  points: Point[];
  labelVisible?: boolean;
};
function meshAnnotation(
  points: Point[],
  center: Point,
  edges: PhysicalEdge[],
  annotationBoxes: Box[],
): { center: Point; labelVisible: boolean } {
  const inside = (p: Point) => {
    let result = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i],
        b = points[j];
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        result = !result;
    }
    return result;
  };
  const distance = (p: Point, e: PhysicalEdge) => {
    const dx = e.to[0] - e.from[0],
      dy = e.to[1] - e.from[1],
      t = Math.max(
        0,
        Math.min(
          1,
          ((p[0] - e.from[0]) * dx + (p[1] - e.from[1]) * dy) /
            (dx * dx + dy * dy),
        ),
      );
    return Math.hypot(p[0] - e.from[0] - t * dx, p[1] - e.from[1] - t * dy);
  };
  const boxes = annotationBoxes.map((b) => [b.left, b.top, b.right, b.bottom]);
  const valid = (p: Point) =>
    inside(p) &&
    edges.every((e) => distance(p, e) > 33) &&
    boxes.every(
      ([x1, y1, x2, y2]) =>
        p[0] + 30 < x1 || p[0] - 30 > x2 || p[1] + 23 < y1 || p[1] - 23 > y2,
    );
  const candidates: Point[] = [
    [center[0], center[1] - 60],
    [center[0], center[1] + 60],
    center,
  ];
  for (
    let y = Math.min(...points.map((p) => p[1])) + 40;
    y < Math.max(...points.map((p) => p[1]));
    y += 20
  )
    for (
      let x = Math.min(...points.map((p) => p[0])) + 40;
      x < Math.max(...points.map((p) => p[0]));
      x += 20
    )
      candidates.push([x, y]);
  const chosen = candidates.find(valid);
  return { center: chosen ?? center, labelVisible: !!chosen };
}
export function detectMeshes(topology: Topology): {
  meshes: Mesh[];
  reason?: string;
} {
  if (topology.errors.length) return { meshes: [], reason: topology.errors[0] };
  if (topology.crossings.length)
    return {
      meshes: [],
      reason:
        "图中有未连接的交叉线或导线穿过元件。节点法可按端子分析；使用网孔法前请整理为无交叉的平面电路图。",
    };
  const edges = topology.edges,
    adj = new Map<string, { edge: number; sign: number; angle: number }[]>();
  edges.forEach((e, i) => {
    for (const [a, b, from, to, sign] of [
      [e.a, e.b, e.from, e.to, 1],
      [e.b, e.a, e.to, e.from, -1],
    ] as const) {
      void b;
      if (!adj.has(a)) adj.set(a, []);
      adj.get(a)!.push({
        edge: i,
        sign,
        angle: Math.atan2(to[1] - from[1], to[0] - from[0]),
      });
    }
  });
  for (const list of adj.values()) list.sort((a, b) => a.angle - b.angle);
  const seen = new Set<string>(),
    meshes: Mesh[] = [];
  for (let i = 0; i < edges.length; i++)
    for (const sign of [1, -1]) {
      if (seen.has(`${i}:${sign}`)) continue;
      let next = { edge: i, sign };
      const walk: { edge: number; sign: number }[] = [],
        points: Point[] = [];
      for (let k = 0; k <= edges.length * 2 + 1; k++) {
        const key = `${next.edge}:${next.sign}`;
        if (seen.has(key)) break;
        seen.add(key);
        walk.push(next);
        const e = edges[next.edge];
        points.push(next.sign === 1 ? e.from : e.to);
        const at = next.sign === 1 ? e.b : e.a,
          list = adj.get(at)!;
        const index = list.findIndex(
          (v) => v.edge === next.edge && v.sign === -next.sign,
        );
        next = list[(index + list.length - 1) % list.length];
      }
      let area = 0,
        cx = 0,
        cy = 0;
      points.forEach((p, j) => {
        const q = points[(j + 1) % points.length],
          cross = p[0] * q[1] - q[0] * p[1];
        area += cross;
        cx += (p[0] + q[0]) * cross;
        cy += (p[1] + q[1]) * cross;
      });
      if (area <= 1e-7) continue;
      const coefficients = topology.netlist.components.map(() => 0);
      walk.forEach((w) => {
        const c = edges[w.edge].component;
        if (c !== null) coefficients[c] += w.sign;
      });
      if (coefficients.every((c) => c === 0)) continue;
      meshes.push({
        name: `J${meshes.length + 1}`,
        coefficients,
        ...meshAnnotation(
          points,
          [cx / (3 * area), cy / (3 * area)],
          edges,
          topology.annotationBoxes,
        ),
        points,
      });
    }
  if (meshes.length !== topology.loopCount)
    return {
      meshes: [],
      reason:
        "当前绘图的独立面与电路回路数不一致（例如多处接地通过参考点连接）。请使用节点法，或把公共导线明确画出后使用网孔法。",
    };
  if (!meshes.length)
    return { meshes: [], reason: "该电路没有闭合网孔，使用节点法求解。" };
  return { meshes };
}

/** Every chord closes one fundamental cycle; these are not necessarily geometric meshes. */
export function independentLoops(net: CircuitNetlist): number[][] {
  const tree: { node: string; branch: number; sign: number }[][] =
      net.nodes.map(() => []),
    u = new Union(),
    loops: number[][] = [];
  const idx = (n: string) => net.nodes.findIndex((v) => v.id === n);
  net.components.forEach((c, k) => {
    const [a, b] = c.nodes;
    if (u.root(a) !== u.root(b)) {
      u.join(a, b);
      tree[idx(a)].push({ node: b, branch: k, sign: 1 });
      tree[idx(b)].push({ node: a, branch: k, sign: -1 });
      return;
    }
    const coeff = net.components.map(() => 0);
    coeff[k] = 1;
    const queue = [b],
      seen = new Set([b]),
      parent = new Map<
        string,
        { node: string; branch: number; sign: number }
      >();
    for (let i = 0; i < queue.length && !seen.has(a); i++)
      for (const edge of tree[idx(queue[i])])
        if (!seen.has(edge.node)) {
          seen.add(edge.node);
          parent.set(edge.node, {
            node: queue[i],
            branch: edge.branch,
            sign: edge.sign,
          });
          queue.push(edge.node);
        }
    let at = a;
    while (at !== b) {
      const p = parent.get(at)!;
      coeff[p.branch] += p.sign;
      at = p.node;
    }
    loops.push(coeff);
  });
  return loops;
}
