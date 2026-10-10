import { articles } from "./content";

export type LearningPath = {
  slug: string;
  title: string;
  audience: string;
  description: string;
  prerequisite: string;
  outcome: string;
  slugs: readonly string[];
};
const entries: LearningPath[] = [
  {
    slug: "foundations",
    title: "从零建立电路分析基础",
    audience: "初学者",
    description: "从参考方向和基本定律出发，逐步掌握等效、分析方法与电路定理。",
    prerequisite: "能进行基础代数运算；从第一章全览开始。",
    outcome: "看懂参考方向，选择节点或网孔法，并建立端口等效。",
    slugs: [
      "chapter-1-summary",
      "kcl-kvl",
      "chapter-2-summary",
      "star-delta",
      "source-transformations",
      "input-resistance",
      "chapter-3-summary",
      "mesh-analysis",
      "nodal-analysis",
      "chapter-4-summary",
      "superposition",
      "thevenin",
      "norton",
    ],
  },
  {
    slug: "analysis-review",
    title: "复习电路分析方法",
    audience: "课程复习 / 工程回顾",
    description: "围绕列方程、等效和典型端口问题，回顾最常用的分析工具。",
    prerequisite: "已学过欧姆定律、KCL与KVL；遇到卡点可沿前置知识补齐。",
    outcome: "比较节点、网孔、叠加和戴维宁方法的适用场景。",
    slugs: [
      "source-transformations",
      "input-resistance",
      "bridge-arm",
      "mesh-analysis",
      "nodal-analysis",
      "superposition",
      "thevenin",
      "norton",
    ],
  },
  {
    slug: "ac-to-three-phase",
    title: "从相量走向三相电路",
    audience: "交流专题",
    description: "串联复数、正弦量、阻抗、相量图与三相计算，形成交流分析体系。",
    prerequisite: "掌握电路基本定律与储能元件；可从复数专题补数学基础。",
    outcome: "画出串并联相量图，区分线值与相值，计算三相电流和功率。",
    slugs: [
      "complex-euler",
      "sinusoidal",
      "phasor",
      "impedance",
      "phasor-diagrams",
      "power",
      "power-factor",
      "three-phase-basics",
      "line-phase",
      "balanced-three-phase",
      "unbalanced-three-phase",
      "three-phase-power",
    ],
  },
];
// Goal-oriented routes retain the textbook order within their selected lessons.
export const learningPaths = entries.map((entry) => ({
  ...entry,
  slugs: articles
    .filter((article) => entry.slugs.includes(article.slug))
    .map((article) => article.slug),
}));
