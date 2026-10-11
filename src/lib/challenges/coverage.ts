import coverage from "./section-exercises.json";
import textbookIndex from "./textbook-catalogue.json";

type SectionExercises = { ids: string[]; focus: string };
export const sectionExercises: Readonly<Record<string, SectionExercises>> =
  coverage;
export function textbookExerciseIds(slug: string): string[] {
  return [
    ...new Set([
      ...(sectionExercises[slug]?.ids ?? []),
      ...textbookIndex
        .filter((problem) => problem.slug === slug)
        .map((problem) => problem.id),
    ]),
  ];
}
