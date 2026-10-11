import data from "./data.json";
import type { Challenge } from "./types";
export const challenges = data as unknown as Challenge[];
export function getChallenge(id: string) {
  const problem = challenges.find((item) => item.id === id);
  if (!problem) throw new Error(`提高题未注册：${id}`);
  return problem;
}
