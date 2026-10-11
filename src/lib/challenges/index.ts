import data from "./data.json";
import textbookData from "./textbook.json";
import type { Challenge } from "./types";
export const originalChallenges = data as unknown as Challenge[];
export const textbookChallenges = textbookData as unknown as Challenge[];
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
