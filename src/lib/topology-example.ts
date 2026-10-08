export type BranchView = "elements" | "series";
export const loopChoices = [
  { id: "12", first: 0, second: 1, title: "L₁₂：左侧网孔", mesh: true },
  { id: "23", first: 1, second: 2, title: "L₂₃：中间网孔", mesh: true },
  { id: "34", first: 2, second: 3, title: "L₃₄：右侧网孔", mesh: true },
  { id: "13", first: 0, second: 2, title: "L₁₃：跨两个网孔", mesh: false },
  { id: "24", first: 1, second: 3, title: "L₂₄：跨两个网孔", mesh: false },
  { id: "14", first: 0, second: 3, title: "L₁₄：最外侧回路", mesh: false },
] as const;
export const legPositions = [90, 240, 390, 540] as const;
export const legComponents = ["R₁ 与 Uₛ 串联", "R₂", "R₃", "R₄"] as const;
export function branchNames(leg: number, view: BranchView) {
  if (view === "series") return [`b${leg + 1}`];
  return leg === 0 ? ["e1", "e2"] : [`e${leg + 2}`];
}
