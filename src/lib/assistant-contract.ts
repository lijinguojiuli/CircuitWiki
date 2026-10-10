import { articles } from "./content";
import { formulas } from "./formulas";
import { textbookReferences } from "./textbook";
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
      .filter((formula) => formula.slug === slug)
      .map(({ name, latex, condition }) => ({ name, latex, condition })),
  };
}
