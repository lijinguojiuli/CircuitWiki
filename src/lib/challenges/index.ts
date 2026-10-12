import data from "./data.json";
import textbookData from "./textbook.json";
import workedData from "./worked-solutions.json";
import type { Challenge, WorkedStep } from "./types";
// JSON arrays infer as number[]; runtime figure validation covers tuple shapes.
export const workedSolutions = workedData as unknown as Record<
  string,
  WorkedStep[]
>;
const withWorkedSteps = (problem: Challenge): Challenge => ({
  ...problem,
  steps: workedSolutions[problem.id] ?? problem.steps,
});
export const originalChallenges = (data as unknown as Challenge[]).map(
  withWorkedSteps,
);
export const textbookChallenges = (textbookData as unknown as Challenge[]).map(
  withWorkedSteps,
);
export const challenges = [...originalChallenges, ...textbookChallenges];
export function textbookSourceReference(
  source: NonNullable<Challenge["source"]>,
): string {
  if (source.kind === "example") return `例${source.exercise}`;
  if (source.kind === "figure") return `图${source.exercise}配套练习`;
  return `习题${source.exercise}`;
}
export function getChallenge(id: string) {
  const problem = challenges.find((item) => item.id === id);
  if (!problem) throw new Error(`提高题未注册：${id}`);
  return problem;
}
