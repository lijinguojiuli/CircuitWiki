import type {
  CircuitNetlist,
  EquationRow,
  EquationSystem,
  TeachingStep,
} from "./types";
import { detectMeshes, type Mesh, type Topology } from "./topology";
import { solveMatrix, type EliminationStep } from "./matrix-solver";

export type AnalysisMethod = "auto" | "nodal" | "mesh";
export type BranchResult = {
  id: string;
  current: number;
  voltage: number;
  power: number;
};
export type CircuitAnalysis = {
  status: "solved" | "error" | "empty";
  method: "nodal" | "mesh";
  reason: string;
  error?: string;
  equations: EquationRow[];
  matrix?: EquationSystem;
  matrixLatex?: string;
  steps: TeachingStep[];
  voltages: Record<string, number>;
  branches: BranchResult[];
  meshes: Mesh[];
  meshReason?: string;
  elimination: EliminationStep[];
  rowScale?: number[];
  columnScale?: number[];
  residual?: number;
  powerBalance?: number;
};
export const numberTex = (v: number) => {
  if (v === 0) return "0";
  const n = Number(v.toPrecision(7));
  const [base, exp] = String(n).split("e");
  return exp ? `${base}\\times10^{${Number(exp)}}` : base;
};
export const voltageName = (node: string) =>
  node === "N0" ? "0" : `U_{${Number(node.slice(1))}}`;
const componentName = (id: string) => `${id[0]}_{${id.slice(1)}}`;
export function matrixLatex(system: EquationSystem) {
  return `\\underbrace{\\begin{bmatrix}${system.coefficients.map((row) => row.map(numberTex).join("&")).join("\\\\")}\\end{bmatrix}}_{A}\\underbrace{\\begin{bmatrix}${system.unknowns.map((u) => u.symbol).join("\\\\")}\\end{bmatrix}}_{X}=\\underbrace{\\begin{bmatrix}${system.rhs.map(numberTex).join("\\\\")}\\end{bmatrix}}_{B}`;
}
function sumTerms(terms: { sign: number; term: string }[]) {
  return terms.length
    ? terms
        .map((t, i) => `${t.sign < 0 ? "-" : i ? "+" : ""}${t.term}`)
        .join("")
    : "0";
}
function nodalSystem(net: CircuitNetlist): {
  system: EquationSystem;
  equations: EquationRow[];
} {
  const nodes = net.nodes.filter((n) => n.id !== net.referenceNodeId),
    sources = net.components.filter((c) => c.type === "voltage-source"),
    size = nodes.length + sources.length;
  const A = Array.from({ length: size }, () => Array(size).fill(0) as number[]),
    b = Array(size).fill(0) as number[];
  const index = (n: string) => nodes.findIndex((v) => v.id === n);
  net.components.forEach((c) => {
    const a = index(c.nodes[0]),
      d = index(c.nodes[1]);
    if (c.type === "resistor") {
      const g = 1 / c.value;
      if (a >= 0) A[a][a] += g;
      if (d >= 0) A[d][d] += g;
      if (a >= 0 && d >= 0) {
        A[a][d] -= g;
        A[d][a] -= g;
      }
    }
    if (c.type === "current-source") {
      if (a >= 0) b[a] -= c.value;
      if (d >= 0) b[d] += c.value;
    }
    if (c.type === "voltage-source") {
      const s = nodes.length + sources.indexOf(c);
      if (a >= 0) {
        A[a][s] += 1;
        A[s][a] += 1;
      }
      if (d >= 0) {
        A[d][s] -= 1;
        A[s][d] -= 1;
      }
      b[s] = c.value;
    }
  });
  const equations = nodes.map((node) => {
    const terms: { sign: number; term: string }[] = [],
      right: { sign: number; term: string }[] = [];
    net.components.forEach((c) => {
      if (c.nodes[0] === c.nodes[1] || !c.nodes.includes(node.id)) return;
      const sign = c.nodes[0] === node.id ? 1 : -1;
      if (c.type === "resistor") {
        const other = sign === 1 ? c.nodes[1] : c.nodes[0];
        terms.push({
          sign: 1,
          term: `\\frac{${voltageName(node.id)}${other === "N0" ? "" : `-${voltageName(other)}`}}{${componentName(c.id)}}`,
        });
      }
      if (c.type === "voltage-source")
        terms.push({ sign, term: `i_{${c.id}}` });
      if (c.type === "current-source")
        right.push({ sign: -sign, term: componentName(c.id) });
    });
    return {
      label: `${node.id}：流出电流为正的 KCL`,
      latex: `${sumTerms(terms)}=${sumTerms(right)}`,
    };
  });
  sources.forEach((c) =>
    equations.push({
      label: `${c.id}：电压源约束（端子1为正）`,
      latex: `${voltageName(c.nodes[0])}-${voltageName(c.nodes[1])}=${componentName(c.id)}`,
    }),
  );
  return {
    system: {
      coefficients: A,
      rhs: b,
      unknowns: [
        ...nodes.map((n) => ({
          symbol: voltageName(n.id),
          unit: "V" as const,
        })),
        ...sources.map((c) => ({ symbol: `i_{${c.id}}`, unit: "A" as const })),
      ],
      rowUnits: [
        ...nodes.map(() => "A" as const),
        ...sources.map(() => "V" as const),
      ],
    },
    equations,
  };
}
function meshSystem(net: CircuitNetlist, meshes: Mesh[]) {
  const sources = net.components.filter((c) => c.type === "current-source"),
    l = meshes.length,
    size = l + sources.length;
  const A = Array.from({ length: size }, () => Array(size).fill(0) as number[]),
    b = Array(size).fill(0) as number[],
    equations: EquationRow[] = [];
  meshes.forEach((m, i) => {
    const left: { sign: number; term: string }[] = [],
      right: { sign: number; term: string }[] = [];
    net.components.forEach((c, k) => {
      const t = m.coefficients[k];
      if (!t) return;
      if (c.type === "resistor") {
        meshes.forEach((n, j) => (A[i][j] += c.value * t * n.coefficients[k]));
        const current = sumTerms(
          meshes.flatMap((n, j) =>
            n.coefficients[k]
              ? [{ sign: n.coefficients[k], term: `J_{${j + 1}}` }]
              : [],
          ),
        );
        left.push({
          sign: t,
          term: `${componentName(c.id)}\\left(${current}\\right)`,
        });
      }
      if (c.type === "voltage-source") {
        b[i] -= t * c.value;
        right.push({ sign: -t, term: componentName(c.id) });
      }
      if (c.type === "current-source") {
        const s = l + sources.indexOf(c);
        A[i][s] += t;
        A[s][i] += t;
        left.push({ sign: t, term: `u_{${c.id}}` });
      }
    });
    equations.push({
      label: `网孔 ${i + 1}：顺时针 KVL`,
      latex: `${sumTerms(left)}=${sumTerms(right)}`,
    });
  });
  sources.forEach((c, i) => {
    b[l + i] = c.value;
    const k = net.components.indexOf(c);
    equations.push({
      label: `${c.id}：电流源约束`,
      latex: `${sumTerms(meshes.flatMap((m, j) => (m.coefficients[k] ? [{ sign: m.coefficients[k], term: `J_{${j + 1}}` }] : [])))}=${componentName(c.id)}`,
    });
  });
  return {
    system: {
      coefficients: A,
      rhs: b,
      unknowns: [
        ...meshes.map((_, i) => ({
          symbol: `J_{${i + 1}}`,
          unit: "A" as const,
        })),
        ...sources.map((c) => ({ symbol: `u_{${c.id}}`, unit: "V" as const })),
      ],
      rowUnits: [
        ...meshes.map(() => "V" as const),
        ...sources.map(() => "A" as const),
      ],
    },
    equations,
  };
}
function explain(
  topology: Topology,
  method: "nodal" | "mesh",
  equations: EquationRow[],
  system: EquationSystem,
  result: number[],
  branches: BranchResult[],
): TeachingStep[] {
  const isNodal = method === "nodal";
  return [
    {
      title: "识别连接与选择参考",
      explanation:
        topology.referenceReason +
        ` 识别到${topology.netlist.nodes.length}个节点、${topology.netlist.components.length}条元件支路，独立回路数 b−n+1=${topology.loopCount}。`,
      equations: [{ label: "参考电位", latex: "U_0=0\\,\\mathrm V" }],
    },
    {
      title: isNodal ? "定义电压与支路方向" : "定义顺时针网孔电流",
      explanation: isNodal
        ? "每个未知节点电压相对 N0 定义。电阻参考电流从端子1流向端子2，i=(Ua−Ub)/R。独立电压源额外引入从正端流向负端的电流未知量，因其电流不能预先由源电压得出。"
        : "图中每个有界面取顺时针网孔电流 J。某支路电流是经过它的网孔电流代数和：同向为正、反向为负；相邻网孔公共支路通常得到两电流之差。",
      equations: isNodal
        ? []
        : topology.netlist.components.map((c, k) => ({
            label: `${c.id}的支路电流`,
            latex: `i_{${c.id}}=${sumTerms(detectMeshes(topology).meshes.flatMap((m, j) => (m.coefficients[k] ? [{ sign: m.coefficients[k], term: `J_{${j + 1}}` }] : [])))}`,
          })),
    },
    {
      title: isNodal ? "逐节点写 KCL，补齐源约束" : "逐网孔写 KVL，补齐源约束",
      explanation: isNodal
        ? "统一按流出节点为正。电流源流入本节点时放右端为正，流出时为负。跨接两未知节点的电压源保留 Ua−Ub=V；它不能当作电阻处理。"
        : "沿顺时针绕行累加电压降。经过电压源从正端到负端计 +V，反向计 −V。电流源的端电压另设未知量，并补其支路电流约束；这也能处理公共电流源，相邻网孔方程组合可得到超网孔方程。",
      equations,
    },
    {
      title: "代入参数并整理 AX = B",
      explanation:
        "按显示的未知量顺序收集系数。这里使用 SI 单位：Ω、V、A。每一行保留自己的电流或电压量纲；不能把混合源约束矩阵的所有元素都称为电导。",
      equations: [{ label: "自动生成的数值矩阵", latex: matrixLatex(system) }],
    },
    {
      title: "主元消元与回代",
      explanation:
        "对矩阵按行、列进行尺度归一化，再选取主元消元并回代，最后还原原变量单位。数值消元过程可在下方展开。负数表示实际方向与所选参考相反。",
      equations: system.unknowns.map((v, i) => ({
        label: v.unit === "V" ? "电压结果" : "电流结果",
        latex: `${v.symbol}=${numberTex(result[i])}\\,\\mathrm{${v.unit}}`,
      })),
    },
    {
      title: "回到原电路检查",
      explanation:
        "用求得的节点电压与支路电流回代元件关系。所有支路均按端子1→2电流、端子1对端子2电压计算 p=ui；正值吸收、负值发出。总功率应接近0。",
      equations: branches.map((b) => ({
        label: `${b.id}：电压、电流与吸收功率`,
        latex: `u_{${b.id}}=${numberTex(b.voltage)}\\,\\mathrm V,\\quad i_{${b.id}}=${numberTex(b.current)}\\,\\mathrm A,\\quad p_{${b.id}}=${numberTex(b.power)}\\,\\mathrm W`,
      })),
    },
  ];
}
export function analyzeCircuit(
  topology: Topology,
  requested: AnalysisMethod = "auto",
): CircuitAnalysis {
  const face = detectMeshes(topology),
    net = topology.netlist;
  const method =
    requested === "auto"
      ? face.meshes.length === 1 &&
        !net.components.some((c) => c.type === "current-source")
        ? "mesh"
        : "nodal"
      : requested;
  const reason =
    requested !== "auto"
      ? `按你的选择使用${method === "nodal" ? "节点电压法" : "网孔电流法"}。`
      : method === "mesh"
        ? "该电路只有一个网孔且没有电流源，用一个顺时针网孔电流列 KVL 更直接。"
        : "采用节点电压法，以节点电压和电压源支路电流建立通用方程；电流源可直接进入 KCL 的注入项。";
  const base: CircuitAnalysis = {
    status: "empty",
    method,
    reason,
    equations: [],
    steps: [],
    voltages: {},
    branches: [],
    meshes: face.meshes,
    meshReason: face.reason,
    elimination: [],
  };
  if (!net.components.length) return base;
  const errors = [...topology.errors];
  for (const c of net.components)
    if (!Number.isFinite(c.value) || (c.type === "resistor" && c.value <= 0))
      errors.push(`${c.id}参数无效。`);
  if (method === "mesh" && face.reason) errors.push(face.reason);
  if (errors.length)
    return { ...base, status: "error", error: errors.join(" ") };
  if (
    method === "nodal" &&
    net.nodes.length === 1 &&
    !net.components.some((c) => c.type === "voltage-source")
  ) {
    const branches = net.components.map((c) => ({
      id: c.id,
      current: c.type === "current-source" ? c.value : 0,
      voltage: 0,
      power: 0,
    }));
    const equations = branches.map((b) => ({
      label: `${b.id}两端短接`,
      latex: `u_{${b.id}}=0,\\quad i_{${b.id}}=${numberTex(b.current)}\\,\\mathrm A`,
    }));
    return {
      ...base,
      status: "solved",
      voltages: { N0: 0 },
      branches,
      residual: 0,
      powerBalance: 0,
      equations,
      steps: [
        {
          title: "识别单节点连接",
          explanation:
            "所有元件两端均被理想导线接到同一节点，因此端电压都为0，没有需要消元的未知节点电压。",
          equations: [{ label: "参考节点", latex: "U_0=0" }],
        },
        {
          title: "由元件定义求支路量",
          explanation:
            "被短接电阻的电流为0；理想电流源的电流仍由其自身设定，端电压为0，所以吸收功率均为0。",
          equations,
        },
      ],
    };
  }
  const { system, equations } =
    method === "nodal" ? nodalSystem(net) : meshSystem(net, face.meshes);
  if (!system.coefficients.length)
    return {
      ...base,
      status: "error",
      error: "没有足够的独立方程。请检查元件与参考节点。",
    };
  let solved;
  try {
    solved = solveMatrix(system.coefficients, system.rhs);
  } catch (e) {
    return { ...base, status: "error", error: (e as Error).message };
  }
  const initial = {
    ...base,
    matrix: system,
    matrixLatex: matrixLatex(system),
    equations,
    elimination: solved.steps,
    rowScale: solved.rowScale,
    columnScale: solved.columnScale,
  };
  if (solved.status !== "unique")
    return {
      ...initial,
      status: "error",
      error:
        solved.status === "inconsistent"
          ? "约束冲突：这些理想源与连接没有共同解。检查不同电压源并联、非零电压源被短接，或电流源强迫电流流入开路。"
          : solved.status === "underdetermined"
            ? "结果不能唯一确定。可能存在悬浮电位、冗余并联电压源或串联电流源导致的未定内部量；请检查并化简后重试。"
            : "当前参数使方程数值不稳定，回代未通过。请检查极端参数与连接。",
    };
  const voltages: Record<string, number> = { N0: 0 };
  let branches: BranchResult[] = [];
  if (method === "nodal") {
    const nodes = net.nodes.filter((n) => n.id !== "N0"),
      vs = net.components.filter((c) => c.type === "voltage-source");
    nodes.forEach((n, i) => (voltages[n.id] = solved.values[i]));
    branches = net.components.map((c) => {
      const voltage = voltages[c.nodes[0]] - voltages[c.nodes[1]],
        current =
          c.type === "resistor"
            ? voltage / c.value
            : c.type === "current-source"
              ? c.value
              : solved.values[nodes.length + vs.indexOf(c)];
      return { id: c.id, voltage, current, power: voltage * current };
    });
  } else {
    const sources = net.components.filter((c) => c.type === "current-source"),
      l = face.meshes.length;
    branches = net.components.map((c, k) => {
      const current = face.meshes.reduce(
          (sum, m, j) => sum + m.coefficients[k] * solved.values[j],
          0,
        ),
        voltage =
          c.type === "resistor"
            ? current * c.value
            : c.type === "voltage-source"
              ? c.value
              : solved.values[l + sources.indexOf(c)];
      return { id: c.id, current, voltage, power: current * voltage };
    });
    for (let round = 0; round < net.nodes.length; round++)
      net.components.forEach((c, k) => {
        const [a, b] = c.nodes;
        if (a in voltages && !(b in voltages))
          voltages[b] = voltages[a] - branches[k].voltage;
        else if (b in voltages && !(a in voltages))
          voltages[a] = voltages[b] + branches[k].voltage;
      });
  }
  const powerBalance = branches.reduce((sum, b) => sum + b.power, 0);
  if (
    ![
      ...Object.values(voltages),
      ...branches.flatMap((b) => [b.current, b.voltage, b.power]),
      powerBalance,
    ].every(Number.isFinite)
  )
    return {
      ...initial,
      status: "error",
      error:
        "参数使结果超出数值范围，无法可靠显示电压、电流或功率。请检查数量级。",
    };
  return {
    ...initial,
    status: "solved",
    voltages,
    branches,
    residual: solved.residual,
    powerBalance,
    steps: explain(
      topology,
      method,
      equations,
      system,
      solved.values,
      branches,
    ),
  };
}
