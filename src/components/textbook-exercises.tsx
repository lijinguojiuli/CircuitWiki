import { ChallengeProblem } from "./challenge-problem";
import {
  sectionExercises,
  textbookExerciseIds,
} from "@/lib/challenges/coverage";

export function TextbookExercises({ slug }: { slug: string }) {
  const exercises = textbookExerciseIds(slug);
  if (!exercises.length) return null;
  return (
    <div className="textbook-section-practice" data-textbook-section={slug}>
      <h3>本节教材配套练习</h3>
      <p className="textbook-section-focus">
        <strong>本节重点：</strong>
        {sectionExercises[slug]?.focus}
      </p>
      {exercises.map((id) => (
        <ChallengeProblem key={id} id={id} />
      ))}
    </div>
  );
}
