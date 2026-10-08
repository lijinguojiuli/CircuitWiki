export type FormulaEntry = {
  name: string;
  latex: string;
  category: string;
  slug: string;
  condition: string;
  parameters: string[];
  source: string;
};
export const formulas: FormulaEntry[] = [
  {
    name: "欧姆定律",
    latex: "u=Ri",
    category: "基础电路",
    slug: "kcl-kvl",
    condition: "线性电阻，电压电流取关联参考方向。",
    parameters: ["u：电压 / V", "i：电流 / A", "R：电阻 / Ω"],
    source: "第5版 p.13，式（1-3）",
  },
  {
    name: "电功率",
    latex: "p=ui=Ri^2=\\frac{u^2}{R}",
    category: "基础电路",
    slug: "kcl-kvl",
    condition: "后两式仅用于电阻；p=ui 采用关联参考方向。",
    parameters: [
      "p：瞬时功率 / W",
      "u：电压 / V",
      "i：电流 / A",
      "R：电阻 / Ω",
    ],
    source: "第5版 p.15，式（1-5）",
  },
  {
    name: "基尔霍夫电流定律",
    latex: "\\sum i=0",
    category: "基础电路",
    slug: "kcl-kvl",
    condition: "集总电路节点，流入与流出符号相反。",
    parameters: ["i：支路电流 / A"],
    source: "第5版 p.21，§1-8",
  },
  {
    name: "电容伏安关系",
    latex: "i=C\\frac{du}{dt}",
    category: "电容",
    slug: "capacitor",
    condition: "理想线性电容，关联参考方向。",
    parameters: [
      "C：电容 / F",
      "u：瞬时电压 / V",
      "i：瞬时电流 / A",
      "t：时间 / s",
    ],
    source: "第5版 p.126，式（6-2）",
  },
  {
    name: "电容储能",
    latex: "W_C(t)=\\frac12 Cu^2(t)",
    category: "电容",
    slug: "capacitor",
    condition: "理想线性电容。",
    parameters: ["WC：能量 / J", "C：电容 / F", "u(t)：电压 / V"],
    source: "第5版 p.128，式（6-8）",
  },
  {
    name: "RC 时间常数",
    latex: "\\tau=RC",
    category: "电容",
    slug: "rc-circuit",
    condition: "R 为电容端口看到的等效电阻，R>0。",
    parameters: ["τ：时间常数 / s", "R：等效电阻 / Ω", "C：电容 / F"],
    source: "第5版 p.141，§7-2",
  },
  {
    name: "电感伏安关系",
    latex: "u=L\\frac{di}{dt}",
    category: "电感",
    slug: "inductor",
    condition: "理想线性电感，关联参考方向。",
    parameters: [
      "L：电感 / H",
      "i：瞬时电流 / A",
      "u：瞬时电压 / V",
      "t：时间 / s",
    ],
    source: "第5版 p.130，式（6-11）",
  },
  {
    name: "电感储能",
    latex: "W_L(t)=\\frac12 Li^2(t)",
    category: "电感",
    slug: "inductor",
    condition: "理想线性电感。",
    parameters: ["WL：能量 / J", "L：电感 / H", "i(t)：电流 / A"],
    source: "第5版 p.130，式（6-16）的电流形式",
  },
  {
    name: "电阻阻抗",
    latex: "Z_R=R",
    category: "正弦稳态",
    slug: "impedance",
    condition: "理想电阻，同频正弦稳态。",
    parameters: ["Z：阻抗 / Ω", "R：电阻 / Ω"],
    source: "第5版 p.223，§9-1",
  },
  {
    name: "电感阻抗",
    latex: "Z_L=j\\omega L",
    category: "正弦稳态",
    slug: "impedance",
    condition: "理想电感，同频正弦稳态。",
    parameters: ["ω：角频率 / rad·s⁻¹", "L：电感 / H", "j：虚数单位"],
    source: "第5版 p.223，§9-1",
  },
  {
    name: "电容阻抗",
    latex: "Z_C=-j\\frac1{\\omega C}",
    category: "正弦稳态",
    slug: "impedance",
    condition: "理想电容，ω>0，同频正弦稳态。",
    parameters: ["ω：角频率 / rad·s⁻¹", "C：电容 / F", "j：虚数单位"],
    source: "第5版 p.223，§9-1",
  },
  {
    name: "有功功率",
    latex: "P=UI\\cos\\phi_Z",
    category: "正弦稳态",
    slug: "power",
    condition: "U、I 使用有效值，同频正弦稳态。",
    parameters: [
      "P：有功功率 / W",
      "φZ：电压相位减电流相位",
      "U：有效电压 / V",
      "I：有效电流 / A",
    ],
    source: "第5版 p.235，§9-4",
  },
];
