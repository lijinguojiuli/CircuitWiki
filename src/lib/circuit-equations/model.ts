import type {
  CircuitComponent,
  CircuitNetlist,
  PlacedComponent,
  Point,
} from "./types";

export const componentDefinitions = {
  resistor: {
    label: "电阻",
    symbol: "R",
    unit: "Ω",
    convention: "电流参考方向：端子1 → 端子2",
  },
  "voltage-source": {
    label: "独立电压源",
    symbol: "V",
    unit: "V",
    convention: "电压极性：端子1为正，端子2为负",
  },
  "current-source": {
    label: "独立电流源",
    symbol: "I",
    unit: "A",
    convention: "电流参考方向：端子1 → 端子2",
  },
} as const;

export function formatComponentValue(component: CircuitComponent): string {
  const { value, type } = component;
  const unit = componentDefinitions[type].unit;
  if (value === 0) return `0 ${unit}`;
  const abs = Math.abs(value);
  const [scale, prefix] =
    abs >= 1e6
      ? [1e6, "M"]
      : abs >= 1e3
        ? [1e3, "k"]
        : abs < 1e-3
          ? [1e-6, "μ"]
          : abs < 1
            ? [1e-3, "m"]
            : [1, ""];
  return `${Number((value / scale).toPrecision(6))} ${prefix}${unit}`;
}

/** Local terminal 0 is left and terminal 1 is right. SVG positive rotation is clockwise. */
export function componentTerminals(
  component: PlacedComponent,
): readonly [Point, Point] {
  const vectors = {
    0: [40, 0],
    90: [0, 40],
    180: [-40, 0],
    270: [0, -40],
  } as const;
  const [dx, dy] = vectors[component.rotation];
  const [x, y] = component.position;
  return [
    [x - dx, y - dy],
    [x + dx, y + dy],
  ];
}

/** Structural checks only. Electrical consistency and singular systems belong to the solver phase. */
export function validateNetlist(netlist: CircuitNetlist): string[] {
  const errors: string[] = [];
  const nodes = new Set(netlist.nodes.map((n) => n.id));
  const ids = new Set<string>();
  if (netlist.version !== 1) errors.push("不支持的网表版本。");
  if (
    nodes.size !== netlist.nodes.length ||
    netlist.nodes.some((n) => !n.id.trim())
  )
    errors.push("节点编号必须唯一且非空。");
  if (netlist.referenceNodeId !== null && !nodes.has(netlist.referenceNodeId))
    errors.push("参考节点必须属于当前网表。");
  for (const c of netlist.components) {
    if (!c.id.trim() || ids.has(c.id))
      errors.push(`元件编号重复或为空：${c.id}`);
    ids.add(c.id);
    if (!Object.hasOwn(componentDefinitions, c.type)) {
      errors.push(`暂不支持元件类型：${c.id}`);
      continue;
    }
    if (!Number.isFinite(c.value) || (c.type === "resistor" && c.value <= 0))
      errors.push(`${c.id}参数无效；电阻必须为有限正数，源值必须为有限数。`);
    if (c.nodes.length !== 2 || c.nodes.some((n) => !nodes.has(n)))
      errors.push(`${c.id}的两个端子必须连接已有节点。`);
  }
  return errors;
}

export function serializeNetlist(netlist: CircuitNetlist): string {
  const errors = validateNetlist(netlist);
  if (errors.length) throw new Error(errors.join(" "));
  return JSON.stringify(netlist, null, 2);
}
