import type { CircuitDocument, ComponentType, Point } from "./types";

export const BOARD = { width: 1000, height: 640, grid: 20 };
export const equalPoint = (a: Point, b: Point) =>
  a[0] === b[0] && a[1] === b[1];
export const pointKey = (p: Point) => `${p[0]},${p[1]}`;
export function snap(p: Point, margin = 20): Point {
  return [
    Math.max(
      margin,
      Math.min(BOARD.width - margin, Math.round(p[0] / 20) * 20),
    ),
    Math.max(
      margin,
      Math.min(BOARD.height - margin, Math.round(p[1] / 20) * 20),
    ),
  ];
}
export function onSegment(p: Point, a: Point, b: Point) {
  return (
    Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) <
      1e-7 &&
    p[0] >= Math.min(a[0], b[0]) &&
    p[0] <= Math.max(a[0], b[0]) &&
    p[1] >= Math.min(a[1], b[1]) &&
    p[1] <= Math.max(a[1], b[1])
  );
}
export const wireContains = (points: Point[], p: Point) =>
  points.slice(1).some((b, i) => onSegment(p, points[i], b));
export function orthogonal(a: Point, b: Point): Point[] {
  return a[0] === b[0] || a[1] === b[1] ? [a, b] : [a, [b[0], a[1]], b];
}
export function cleanPath(points: Point[]): Point[] {
  const result: Point[] = [];
  for (const p of points) {
    if (result.length && equalPoint(result.at(-1)!, p)) continue;
    while (result.length >= 2) {
      const a = result.at(-2)!,
        b = result.at(-1)!;
      if (
        ((a[0] === b[0] && b[0] === p[0]) ||
          (a[1] === b[1] && b[1] === p[1])) &&
        onSegment(b, a, p)
      )
        result.pop();
      else break;
    }
    if (!result.length || !equalPoint(result.at(-1)!, p)) result.push(p);
  }
  return result;
}

export const nextId = (prefix: string, ids: string[]) => {
  let i = 1;
  while (ids.includes(prefix + i)) i++;
  return prefix + i;
};
export function addComponent(
  doc: CircuitDocument,
  type: ComponentType,
  point: Point,
): CircuitDocument {
  const position = snap(point, 80);
  if (
    doc.components.some(
      (c) =>
        Math.hypot(c.position[0] - position[0], c.position[1] - position[1]) <
        80,
    )
  )
    throw new Error("这里已有元件，请选择空白位置。");
  if (doc.components.length >= 40)
    throw new Error("教学画板最多放置40个元件。");
  const prefix = {
    resistor: "R",
    "voltage-source": "V",
    "current-source": "I",
  }[type];
  return {
    ...doc,
    components: [
      ...doc.components,
      {
        id: nextId(
          prefix,
          doc.components.map((c) => c.id),
        ),
        name: {
          resistor: "电阻",
          "voltage-source": "电压源",
          "current-source": "电流源",
        }[type],
        type,
        value:
          type === "resistor" ? 1000 : type === "voltage-source" ? 10 : 0.001,
        position,
        rotation:
          type === "resistor" ? 0 : type === "current-source" ? 270 : 90,
      },
    ],
  };
}

export function parseDocument(input: unknown): CircuitDocument {
  if (!input || typeof input !== "object")
    throw new Error("图纸必须是 JSON 对象。");
  const d = input as CircuitDocument;
  if (
    d.version !== 1 ||
    d.gridSize !== 20 ||
    !Array.isArray(d.components) ||
    !Array.isArray(d.wires) ||
    !Array.isArray(d.grounds) ||
    !Array.isArray(d.junctions)
  )
    throw new Error(
      "图纸格式不正确。请导入“保存图纸”导出的 JSON；网表不包含绘图坐标。",
    );
  if (
    d.components.length > 40 ||
    d.wires.length > 120 ||
    d.grounds.length > 40 ||
    d.junctions.length > 160 ||
    d.wires.reduce(
      (sum, w) => sum + (Array.isArray(w?.points) ? w.points.length : 0),
      0,
    ) > 1200
  )
    throw new Error("图纸超过教学画板容量（40元件、120导线、1200个折点）。");
  const point = (p: unknown): p is Point =>
    Array.isArray(p) &&
    p.length === 2 &&
    p.every(Number.isFinite) &&
    p[0] >= 0 &&
    p[0] <= BOARD.width &&
    p[1] >= 0 &&
    p[1] <= BOARD.height &&
    p.every((v) => v % 20 === 0);
  const ids = new Set<string>();
  for (const c of d.components) {
    if (
      !c ||
      !Object.hasOwn(
        { resistor: 1, "voltage-source": 1, "current-source": 1 },
        c.type,
      ) ||
      !/^([RVI])[1-9]\d{0,3}$/.test(c.id) ||
      !c.id.startsWith(
        { resistor: "R", "voltage-source": "V", "current-source": "I" }[c.type],
      ) ||
      ids.has(c.id) ||
      typeof c.name !== "string" ||
      c.name.length > 64 ||
      !Number.isFinite(c.value) ||
      (c.type === "resistor" && c.value <= 0) ||
      !point(c.position) ||
      c.position[0] < 80 ||
      c.position[0] > 920 ||
      c.position[1] < 80 ||
      c.position[1] > 560 ||
      ![0, 90, 180, 270].includes(c.rotation)
    )
      throw new Error(
        "元件数据无效：检查唯一编号、有限参数、正电阻、坐标与旋转角度。",
      );
    ids.add(c.id);
  }
  for (const w of d.wires) {
    if (
      !w ||
      !/^W[1-9]\d{0,3}$/.test(w.id) ||
      ids.has(w.id) ||
      !Array.isArray(w.points) ||
      w.points.length < 2 ||
      w.points.length > 80 ||
      !w.points.every(point) ||
      w.points
        .slice(1)
        .some((p, i) => p[0] !== w.points[i][0] && p[1] !== w.points[i][1])
    )
      throw new Error("导线必须有唯一编号，由网格上的水平或竖直线段组成。");
    ids.add(w.id);
  }
  for (const g of d.grounds) {
    if (
      !g ||
      !/^G[1-9]\d{0,3}$/.test(g.id) ||
      ids.has(g.id) ||
      !point(g.position)
    )
      throw new Error("接地标记无效。");
    ids.add(g.id);
  }
  if (!d.junctions.every(point)) throw new Error("连接点坐标无效。");
  return {
    version: 1,
    title: typeof d.title === "string" ? d.title.slice(0, 80) : "我的电路",
    gridSize: 20,
    components: d.components.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      value: c.value,
      position: [...c.position],
      rotation: c.rotation,
    })),
    wires: d.wires.map((w) => ({
      id: w.id,
      points: w.points.map((p) => [...p]),
    })),
    grounds: d.grounds.map((g) => ({ id: g.id, position: [...g.position] })),
    junctions: d.junctions.map((p) => [...p]),
  };
}
