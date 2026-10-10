import { articles } from "./content";
import { chapterForArticle } from "./chapters";

export const knowledgeAreas = [
  {
    id: "language",
    title: "电路基本概念",
    chapters: [1],
    description: "参考方向、元件模型与基本定律",
  },
  {
    id: "analysis",
    title: "等效与电路分析",
    chapters: [2, 3, 4],
    description: "网络化简、方程与电路定理",
  },
  {
    id: "dynamics",
    title: "储能与动态电路",
    chapters: [6, 7],
    description: "电容、电感与一阶响应",
  },
  {
    id: "ac",
    title: "相量与交流分析",
    chapters: [8, 9],
    description: "正弦量、阻抗、相量图与功率",
  },
  {
    id: "coupling",
    title: "耦合与谐振",
    chapters: [10, 11],
    description: "同名端、理想变压器与谐振",
  },
  {
    id: "three-phase",
    title: "三相电路",
    chapters: [12],
    description: "Y / Δ、线相关系与三相功率",
  },
] as const;
export type KnowledgeArea = (typeof knowledgeAreas)[number];
export const areaForArticle = (slug: string) =>
  knowledgeAreas.find((area) =>
    (area.chapters as readonly number[]).includes(
      chapterForArticle(slug).number,
    ),
  )!;
export const articlesInArea = (id: string) =>
  articles.filter((article) => areaForArticle(article.slug).id === id);

// Only real conceptual dependencies are directed. Chapter order is a separate model.
const prerequisiteEntries: Record<string, readonly string[]> = {
  "controlled-sources": ["kcl-kvl"],
  "kcl-kvl": [],
  "star-delta": ["kcl-kvl"],
  "source-transformations": ["kcl-kvl"],
  "input-resistance": ["source-transformations", "controlled-sources"],
  "bridge-arm": ["input-resistance", "thevenin"],
  "mesh-analysis": ["kcl-kvl"],
  "nodal-analysis": ["kcl-kvl", "source-transformations"],
  superposition: ["kcl-kvl", "nodal-analysis"],
  thevenin: ["input-resistance", "nodal-analysis"],
  norton: ["thevenin"],
  capacitor: ["kcl-kvl"],
  inductor: ["kcl-kvl"],
  "rc-circuit": ["capacitor", "thevenin"],
  "rl-circuit": ["inductor", "input-resistance"],
  "complex-euler": [],
  sinusoidal: [],
  phasor: ["sinusoidal", "complex-euler"],
  impedance: ["phasor", "capacitor", "inductor"],
  "phasor-diagrams": ["impedance"],
  power: ["impedance", "phasor-diagrams"],
  "power-factor": ["power"],
  "coupled-inductors": ["inductor", "phasor"],
  rlc: ["impedance", "phasor-diagrams"],
  "three-phase-basics": ["phasor"],
  "line-phase": ["three-phase-basics"],
  "balanced-three-phase": ["line-phase", "impedance"],
  "unbalanced-three-phase": ["line-phase", "nodal-analysis"],
  "three-phase-power": ["balanced-three-phase", "power"],
};
const relatedEntries: Record<string, readonly string[]> = {
  "nodal-analysis": ["mesh-analysis", "controlled-sources"],
  "mesh-analysis": ["nodal-analysis"],
  thevenin: ["norton", "superposition", "bridge-arm"],
  "rc-circuit": ["rl-circuit"],
  "rl-circuit": ["rc-circuit"],
  "phasor-diagrams": ["rlc", "line-phase"],
  "balanced-three-phase": ["unbalanced-three-phase", "three-phase-power"],
};
export const prerequisitesFor = (slug: string): readonly string[] =>
  prerequisiteEntries[slug] ?? [];
export function knowledgeRelations(slug: string) {
  const chapter = chapterForArticle(slug);
  const prerequisites = prerequisitesFor(slug);
  const subsequent = articles
    .filter((article) => prerequisitesFor(article.slug).includes(slug))
    .map((article) => article.slug);
  const candidates = slug.startsWith("chapter-")
    ? chapter.slugs
    : [
        ...(relatedEntries[slug] ?? []),
        ...Object.entries(relatedEntries)
          .filter(([, values]) => values.includes(slug))
          .map(([key]) => key),
        `chapter-${chapter.number}-summary`,
      ];
  return {
    prerequisites,
    subsequent,
    related: [...new Set(candidates)].filter(
      (item) =>
        item !== slug &&
        !prerequisites.includes(item) &&
        !subsequent.includes(item),
    ),
    parent: areaForArticle(slug),
  };
}
