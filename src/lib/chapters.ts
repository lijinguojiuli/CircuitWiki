export type Chapter = {
  number: number;
  title: string;
  description: string;
  slugs: readonly string[];
  skipped?: boolean;
  legacyAnchor?: string;
};
export const chapters: readonly Chapter[] = [
  {
    number: 1,
    title: "电路模型和电路定律",
    description: "参考方向、基本元件、受控电源与基尔霍夫定律。",
    slugs: [
      "circuit-model",
      "reference-directions",
      "power-energy",
      "circuit-elements",
      "resistor",
      "independent-sources",
      "controlled-sources",
      "kcl-kvl",
    ],
    legacyAnchor: "电路基础",
  },
  {
    number: 2,
    title: "电阻电路的等效变换",
    description: "星三角变换、实际电源等效与输入电阻。",
    slugs: [
      "equivalence-introduction",
      "equivalent-circuits",
      "series-parallel",
      "star-delta",
      "source-connections",
      "source-transformations",
      "input-resistance",
    ],
  },
  {
    number: 3,
    title: "电阻电路的一般分析",
    description: "选择合适的未知量，建立网孔或结点方程。",
    slugs: [
      "circuit-graphs",
      "independent-equations",
      "branch-current",
      "mesh-analysis",
      "loop-current",
      "nodal-analysis",
    ],
  },
  {
    number: 4,
    title: "电路定理",
    description: "叠加、替代、端口等效与最大功率传输。",
    slugs: ["superposition", "substitution", "thevenin", "maximum-power"],
  },
  {
    number: 5,
    title: "含有运算放大器的电阻电路",
    description: "本章不纳入当前学习范围，直接进入第6章。",
    slugs: [],
    skipped: true,
  },
  {
    number: 6,
    title: "储能元件",
    description: "电容、电感的伏安关系、储能与连续性。",
    slugs: ["capacitor", "inductor", "storage-networks"],
    legacyAnchor: "动态电路",
  },
  {
    number: 7,
    title: "一阶电路和二阶电路的时域分析",
    description: "初始条件与一阶电路的零输入、零状态、全响应。",
    slugs: [
      "initial-conditions",
      "zero-input",
      "zero-state",
      "complete-response",
    ],
  },
  {
    number: 8,
    title: "相量法",
    description: "正弦量、有效值相量与电路定律的相量形式。",
    slugs: ["complex-euler", "sinusoidal", "phasor", "phasor-laws"],
    legacyAnchor: "正弦稳态",
  },
  {
    number: 9,
    title: "正弦稳态电路的分析",
    description: "阻抗、导纳、交流功率与功率因数。",
    slugs: [
      "impedance",
      "phasor-diagrams",
      "sinusoidal-analysis",
      "power",
      "complex-power",
      "ac-maximum-power",
    ],
  },
  {
    number: 10,
    title: "含有耦合电感的电路",
    description: "从互感和同名端入门，正确判断互感电压的符号。",
    slugs: [
      "coupled-inductors",
      "coupled-analysis",
      "coupled-power",
      "ideal-transformer",
    ],
  },
  {
    number: 11,
    title: "电路的频率响应",
    description: "串联和并联谐振的条件、输入特性与支路响应。",
    slugs: ["series-resonance", "parallel-resonance"],
  },
  {
    number: 12,
    title: "三相电路",
    description: "相序、线量与相量、对称与不对称计算、三相功率。",
    slugs: [
      "three-phase-basics",
      "line-phase",
      "balanced-three-phase",
      "unbalanced-three-phase",
      "three-phase-power",
    ],
    legacyAnchor: "三相电路",
  },
];
const locations: Readonly<Record<string, readonly [number, number]>> = {
  "circuit-model": [1, 1],
  "reference-directions": [1, 2],
  "power-energy": [1, 3],
  "circuit-elements": [1, 4],
  resistor: [1, 5],
  "independent-sources": [1, 6],
  "controlled-sources": [1, 7],
  "kcl-kvl": [1, 8],
  "equivalence-introduction": [2, 1],
  "equivalent-circuits": [2, 2],
  "series-parallel": [2, 3],
  "star-delta": [2, 4],
  "source-connections": [2, 5],
  "source-transformations": [2, 6],
  "input-resistance": [2, 7],
  "circuit-graphs": [3, 1],
  "independent-equations": [3, 2],
  "branch-current": [3, 3],
  "mesh-analysis": [3, 4],
  "loop-current": [3, 5],
  "nodal-analysis": [3, 6],
  superposition: [4, 1],
  substitution: [4, 2],
  thevenin: [4, 3],
  "maximum-power": [4, 4],
  capacitor: [6, 1],
  inductor: [6, 2],
  "storage-networks": [6, 3],
  "initial-conditions": [7, 1],
  "zero-input": [7, 2],
  "zero-state": [7, 3],
  "complete-response": [7, 4],
  "complex-euler": [8, 1],
  sinusoidal: [8, 2],
  phasor: [8, 3],
  "phasor-laws": [8, 4],
  impedance: [9, 1],
  "phasor-diagrams": [9, 2],
  "sinusoidal-analysis": [9, 3],
  power: [9, 4],
  "complex-power": [9, 5],
  "ac-maximum-power": [9, 6],
  "coupled-inductors": [10, 1],
  "coupled-analysis": [10, 2],
  "coupled-power": [10, 3],
  "ideal-transformer": [10, 5],
  "series-resonance": [11, 2],
  "parallel-resonance": [11, 4],
  "three-phase-basics": [12, 1],
  "line-phase": [12, 2],
  "balanced-three-phase": [12, 3],
  "unbalanced-three-phase": [12, 4],
  "three-phase-power": [12, 5],
  "bridge-arm": [2, 7],
  norton: [4, 3],
  "rc-circuit": [7, 4],
  "rl-circuit": [7, 4],
  "power-factor": [9, 4],
  rlc: [11, 2],
};
export const lessonSections = Object.fromEntries(
  Object.entries(locations).map(([slug, position]) => [slug, position[1]]),
);
export const chapterId = (number: number) => `chapter-${number}`;
export const chapterLabel = (chapter: Chapter) =>
  `第${chapter.number}章 · ${chapter.title}`;
export function chapterForArticle(slug: string): Chapter {
  const chapter = chapters.find((item) => item.number === locations[slug]?.[0]);
  if (!chapter) throw new Error(`知识页没有所属教材章节：${slug}`);
  return chapter;
}
export function lessonSectionLabel(slug: string) {
  return `§${locations[slug][0]}-${locations[slug][1]}`;
}
export const learningChapters = chapters.filter(
  (chapter) => !chapter.skipped && chapter.slugs.length > 0,
);
