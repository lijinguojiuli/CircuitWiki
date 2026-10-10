import { articles } from "./content";
import { chapterForArticle, chapterLabel } from "./chapters";
import { formulas, type FormulaEntry } from "./formulas";
import { learningTools, lessonKind } from "./learning";
import { textbookTopics } from "./textbook-scope";
import { areaForArticle } from "./knowledge";

export const formulaId = (formula: Pick<FormulaEntry, "position">) =>
  `formula-${formula.position.join("-")}`;
export const normalizeSearch = (value: string) =>
  value.toLowerCase().replace(/[\s_{}\\]/g, "");
export const matchesSearch = (query: string, text: string) =>
  query
    .trim()
    .split(/\s+/)
    .every((term) => normalizeSearch(text).includes(normalizeSearch(term)));
export type SearchResult = {
  id: string;
  title: string;
  detail: string;
  kind: string;
  href: string;
  keywords: string;
  area: string;
  chapter: number;
};

const entries: SearchResult[] = [
  ...articles.map((article) => ({
    id: article.slug,
    title: article.title,
    detail: chapterLabel(chapterForArticle(article.slug)),
    kind: lessonKind(article.slug),
    href: `/learn/${article.slug}`,
    keywords: article.keywords.join(" "),
    area: areaForArticle(article.slug).id,
    chapter: chapterForArticle(article.slug).number,
  })),
  ...textbookTopics.map((topic) => ({
    id: topic.anchor,
    title: topic.title,
    detail: `§${topic.chapter}-${topic.section} · 章节全览中的小节`,
    kind: "教材小节",
    href: `/learn/${topic.slug}#${topic.anchor}`,
    keywords: topic.title,
    area: areaForArticle(topic.slug).id,
    chapter: topic.chapter,
  })),
  ...formulas.map((formula) => ({
    id: formulaId(formula),
    title: formula.name,
    detail: `§${formula.position[0]}-${formula.position[1]} · 公式速查`,
    kind: "公式",
    href: `/formulas#${formulaId(formula)}`,
    keywords: `${formula.latex} ${formula.parameters.join(" ")} ${formula.name.includes("时间常数") ? "tau τ tao" : ""}`,
    area: areaForArticle(formula.slug).id,
    chapter: formula.position[0],
  })),
  ...learningTools.map((tool) => ({
    id: `tool-${tool.id}`,
    title: tool.title,
    detail: tool.description,
    kind: "交互工具",
    href: `/tools#${tool.id}`,
    keywords: tool.keywords,
    area: areaForArticle(tool.slug).id,
    chapter: chapterForArticle(tool.slug).number,
  })),
];

export function searchContent(
  query: string,
  limit = 8,
  filter: { kind?: string; area?: string } = {},
): SearchResult[] {
  const normalized = normalizeSearch(query);
  if (!normalized && limit <= 8 && !filter.kind && !filter.area) {
    const popular = [
      "kcl-kvl",
      "nodal-analysis",
      "thevenin",
      "rc-circuit",
      "phasor",
      "tool-rc",
    ];
    return popular
      .map((id) => entries.find((entry) => entry.id === id)!)
      .slice(0, limit);
  }
  return entries
    .filter(
      (entry) =>
        (!filter.kind || entry.kind === filter.kind) &&
        (!filter.area || entry.area === filter.area),
    )
    .map((entry, order) => {
      const title = normalizeSearch(entry.title);
      const score = !normalized
        ? 1
        : title === normalized
          ? 100
          : title.startsWith(normalized)
            ? 80
            : title.includes(normalized)
              ? 60
              : matchesSearch(query, `${entry.title} ${entry.keywords}`)
                ? 20
                : 0;
      // Prefer dedicated lessons to overlapping chapter summaries.
      return {
        entry,
        score: score + (score > 0 && entry.kind === "知识专题" ? 5 : 0),
        order,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((item) => item.entry);
}
