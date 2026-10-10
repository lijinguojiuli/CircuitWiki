// Editorial maintenance log, based on the corresponding content commits.
export const contentUpdates = [
  {
    date: "2026-10-10",
    title: "统一 RC / RL 时间常数的等效电阻记号",
    description: "补充 Req 的端口含义与时间常数条件。",
    slug: "rc-circuit",
    revision: "2b770a8",
  },
  {
    date: "2026-10-10",
    title: "完善输入电阻与电源等效的易错说明",
    description: "区分对外等效和内部电压、电流、功率。",
    slug: "input-resistance",
    revision: "6b82582",
  },
  {
    date: "2026-10-09",
    title: "补充相量画图与三相对照实验",
    description: "用可操作的图解连接公式与几何关系。",
    slug: "phasor-diagrams",
    revision: "29cb873",
  },
] as const;
