import { articles } from "./content";
import { formulas } from "./formulas";
import { textbookReferences } from "./textbook";
import { chapterForArticle, lessonSections } from "./chapters";
export type LearningAssistantContext = {
  slug: string;
  title: string;
  source: { book: string; section: string; pages: string };
  formulas: { name: string; latex: string; condition: string }[];
};
export type LearningAssistantRequest = {
  question: string;
  context: LearningAssistantContext;
};
export type LearningAssistantAnswer = {
  explanation: string;
  citations: { label: string; href: string }[];
  suggestedLessons: string[];
};
export interface LearningAssistantProvider {
  answer(
    request: LearningAssistantRequest,
    signal?: AbortSignal,
  ): Promise<LearningAssistantAnswer>;
}
export function learningAssistantContext(
  slug: string,
): LearningAssistantContext | null {
  const article = articles.find((item) => item.slug === slug);
  if (!article) return null;
  return {
    slug,
    title: article.title,
    source: { book: "邱关源《电路》第5版", ...textbookReferences[slug] },
    formulas: formulas
      .filter(
        (formula) =>
          formula.slug === slug ||
          (formula.position[0] === chapterForArticle(slug).number &&
            formula.position[1] === lessonSections[slug]) ||
          (article.supplemental &&
            ["rc-circuit", "rl-circuit"].includes(slug) &&
            formula.position[0] === 7 &&
            formula.position[1] === 2),
      )
      .map(({ name, latex, condition }) => ({ name, latex, condition })),
  };
}
