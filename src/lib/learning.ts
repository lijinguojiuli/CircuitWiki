import { articles } from "./content";
import { learningChapters } from "./chapters";

/** Stages orient the learner; chapters and lessons retain textbook order. */
export const learningStages = [
  {
    title: "建立电路语言",
    chapters: [1, 2],
    description: "认清参考方向，掌握电路定律与等效变换。",
    outcome: "看懂连接关系，化简电阻网络",
  },
  {
    title: "选择分析方法",
    chapters: [3, 4],
    description: "从列方程到端口等效，找到更合适的解题方法。",
    outcome: "用节点、网孔与定理求解电路",
  },
  {
    title: "理解动态过程",
    chapters: [6, 7],
    description: "认识储能元件，用三要素分析一阶响应。",
    outcome: "求初值、终值和时间常数",
  },
  {
    title: "进入正弦稳态",
    chapters: [8, 9],
    description: "把正弦量化为相量，串起阻抗、相量图与功率。",
    outcome: "用复数分析交流电路",
  },
  {
    title: "连接与谐振",
    chapters: [10, 11],
    description: "理解互感、理想变压器与串并联谐振。",
    outcome: "判断同名端与谐振条件",
  },
  {
    title: "掌握三相系统",
    chapters: [12],
    description: "区分线值与相值，完成 Y / Δ 电路与功率计算。",
    outcome: "从一相出发，分析三相网络",
  },
] as const;

export function lessonKind(slug: string) {
  return slug.startsWith("chapter-")
    ? "章节全览"
    : slug === "bridge-arm"
      ? "综合例题"
      : "知识专题";
}

export function stageLessons(chapterNumbers: readonly number[]) {
  const slugs = learningChapters
    .filter((chapter) => chapterNumbers.includes(chapter.number))
    .flatMap((chapter) => [...chapter.slugs]);
  return articles.filter((article) => slugs.includes(article.slug));
}

export const learningTools = [
  {
    id: "ohm",
    title: "欧姆定律与功率",
    description: "已知两个量，求电压、电流、电阻和功率。",
    slug: "kcl-kvl",
    keywords: "U I R P 欧姆定律 计算器 功率",
    label: "求电压、电流与功率",
  },
  {
    id: "rc",
    title: "RC 响应计算器",
    description: "调整等效电阻和电容，观察时间常数与充电曲线。",
    slug: "rc-circuit",
    keywords: "RC Req 时间常数 tau τ 电容 充电 波形 计算器",
    label: "看电容充电的过程",
  },
  {
    id: "phasor",
    title: "相量计算器",
    description: "转换极坐标、直角坐标，计算同频相量的和与差。",
    slug: "phasor",
    keywords: "相量 复数 极坐标 直角坐标 加减 计算器",
    label: "转换并计算相量",
  },
] as const;

export function relatedTool(slug: string) {
  if (
    ["rc-circuit", "capacitor", "rl-circuit", "chapter-7-summary"].includes(
      slug,
    )
  )
    return learningTools[1];
  if (
    [
      "phasor",
      "sinusoidal",
      "impedance",
      "complex-euler",
      "phasor-diagrams",
      "chapter-8-summary",
      "chapter-9-summary",
    ].includes(slug)
  )
    return learningTools[2];
  return learningTools[0];
}
