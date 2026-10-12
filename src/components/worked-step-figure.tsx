import type { WorkedFigure } from "@/lib/challenges/types";
import { ProblemSchematic, ProblemPhasorDiagram } from "./problem-diagrams";

export function WorkedStepFigure({
  figure,
  id,
}: {
  figure: WorkedFigure;
  id: string;
}) {
  if (figure.kind === "circuit")
    return <ProblemSchematic network={figure.network} title={figure.title} />;
  if (figure.kind === "phasor")
    return <ProblemPhasorDiagram group={figure.group} id={id} />;
  const points = figure.series.flatMap((series) => series.points);
  const xs = points.map((point) => point[0]),
    ys = points.map((point) => point[1]);
  const minX = Math.min(0, ...xs),
    maxX = Math.max(1, ...xs);
  const minY = figure.yDomain?.[0] ?? Math.min(0, ...ys),
    maxY = figure.yDomain?.[1] ?? Math.max(1, ...ys);
  const x = (value: number) => 70 + (540 * (value - minX)) / (maxX - minX);
  const y = (value: number) => 265 - (195 * (value - minY)) / (maxY - minY);
  return (
    <figure className="circuit worked-plot">
      <div
        className="diagram-scroll"
        tabIndex={0}
        role="region"
        aria-label="计算曲线，可横向滚动查看"
      >
        <svg viewBox="0 0 700 350" role="img" aria-label={figure.title}>
          <title>{figure.title}</title>
          <path d={`M70 50V280H625`} fill="none" stroke="currentColor" />
          <text x="75" y="30" style={{ textAnchor: "start" }}>
            {figure.yLabel}
          </text>
          <text x="640" y="315">
            {figure.xLabel}
          </text>
          <text x="62" y="303">
            {minX}
          </text>
          <text x="610" y="303">
            {maxX}
          </text>
          <text x="45" y="75">
            {Number(maxY.toPrecision(4))}
          </text>
          <text x="45" y="265">
            {Number(minY.toPrecision(4))}
          </text>
          {figure.series.map((series, i) => (
            <g key={series.label}>
              <path
                d={series.points
                  .map(
                    (point, index) =>
                      `${index ? "L" : "M"}${x(point[0])} ${y(point[1])}`,
                  )
                  .join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={i ? "7 5" : undefined}
              />
              <text x={105 + i * 220} y="340" style={{ textAnchor: "start" }}>
                {i ? "虚线：" : "实线："}
                {series.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption>{figure.title}</figcaption>
    </figure>
  );
}
