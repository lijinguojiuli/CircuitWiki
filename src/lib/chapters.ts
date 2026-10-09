export type Chapter = {
  number: number;
  title: string;
  description: string;
  slugs: readonly string[];
  skipped?: boolean;
  legacyAnchor?: string;
};

// Chapter numbers stay intact. Slug order is also the previous/next reading order.
const chapterEntries: readonly Chapter[] = [
  {
    number: 1,
    title: "电路模型和电路定律",
    description: "参考方向、基本元件、受控电源与基尔霍夫定律。",
    slugs: ["controlled-sources", "kcl-kvl"],
    legacyAnchor: "电路基础",
  },
  {
    number: 2,
    title: "电阻电路的等效变换",
    description: "星三角变换、实际电源等效与输入电阻。",
    slugs: ["star-delta", "source-transformations", "bridge-arm"],
  },
  {
    number: 3,
    title: "电阻电路的一般分析",
    description: "选择合适的未知量，建立网孔或结点方程。",
    slugs: ["mesh-analysis", "nodal-analysis"],
  },
  {
    number: 4,
    title: "电路定理",
    description: "叠加定理、戴维南定理与诺顿定理。",
    slugs: ["superposition", "thevenin", "norton"],
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
    slugs: ["capacitor", "inductor"],
    legacyAnchor: "动态电路",
  },
  {
    number: 7,
    title: "一阶电路和二阶电路的时域分析",
    description:
      "从初始条件出发，理解零输入、零状态与全响应；当前先学习RC、RL一阶电路。",
    slugs: ["rc-circuit", "rl-circuit"],
  },
  {
    number: 8,
    title: "相量法",
    description: "正弦量、有效值相量与电路定律的相量形式。",
    slugs: ["sinusoidal", "phasor"],
    legacyAnchor: "正弦稳态",
  },
  {
    number: 9,
    title: "正弦稳态电路的分析",
    description: "阻抗、导纳、交流功率与功率因数。",
    slugs: ["impedance", "power", "power-factor"],
  },
  {
    number: 10,
    title: "含有耦合电感的电路",
    description: "从互感和同名端入门，正确判断互感电压的符号。",
    slugs: ["coupled-inductors"],
  },
  {
    number: 11,
    title: "电路的频率响应",
    description: "本章只学习RLC串联谐振，其余频率响应内容不纳入当前范围。",
    slugs: ["rlc"],
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
// A combined lesson is placed at its main textbook section; examples stay next
// to the section they apply. Equal section numbers retain the declared order.
export const lessonSections: Readonly<Record<string, number>> = {
  "controlled-sources": 7,
  "kcl-kvl": 8,
  "star-delta": 4,
  "source-transformations": 6,
  "bridge-arm": 7,
  "mesh-analysis": 4,
  "nodal-analysis": 6,
  superposition: 1,
  thevenin: 3,
  norton: 3,
  capacitor: 1,
  inductor: 2,
  "rc-circuit": 2,
  "rl-circuit": 2,
  sinusoidal: 2,
  phasor: 3,
  impedance: 1,
  power: 4,
  "power-factor": 4,
  "coupled-inductors": 1,
  rlc: 2,
  "three-phase-basics": 1,
  "line-phase": 2,
  "balanced-three-phase": 3,
  "unbalanced-three-phase": 4,
  "three-phase-power": 5,
};
export const chapters: readonly Chapter[] = chapterEntries.map((chapter) => ({
  ...chapter,
  slugs: [...chapter.slugs].sort(
    (a, b) => lessonSections[a] - lessonSections[b],
  ),
}));
export const chapterId = (number: number) => `chapter-${number}`;
export const chapterLabel = (chapter: Chapter) =>
  `第${chapter.number}章 · ${chapter.title}`;
export function chapterForArticle(slug: string): Chapter {
  const chapter = chapters.find((item) => item.slugs.includes(slug));
  if (!chapter) throw new Error(`知识页没有所属教材章节：${slug}`);
  return chapter;
}
export function lessonSectionLabel(slug: string) {
  return `§${chapterForArticle(slug).number}-${lessonSections[slug]}`;
}
