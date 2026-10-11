// Editorial maintenance log, based on the corresponding content commits.
export const contentUpdates = [
  {
    date: "2026-10-11",
    title: "53节全部配教材题，卡片显示实际教材章节",
    description:
      "43组教材习题、例题与图解练习逐节关联，保留来源和本节完成重点。",
    slug: "circuit-model",
    revision: "section-coverage-20261011",
  },
  {
    date: "2026-10-11",
    title: "新增教材带图选题与四种储能元件等效图",
    description:
      "10道教材习题保留题号与书页，按连接、方法、方程、检验展开解答。",
    slug: "storage-networks",
    revision: "textbook-exercises-20261011",
  },
  {
    date: "2026-10-11",
    title: "53个教材小节独立学习，新增53道综合提高题",
    description:
      "每节提供原创多步题、可选提示与分步解答，章节聚合讲解已融入对应小节。",
    slug: "nodal-analysis",
    revision: "sections-20261011",
  },
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
