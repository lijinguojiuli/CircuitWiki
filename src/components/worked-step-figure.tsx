import type { WorkedFigure } from "@/lib/challenges/types";
import {
  ProblemSchematic,
  ProblemPhasorDiagram,
  ProblemAbstractGraph,
} from "./problem-diagrams";

export function WorkedStepFigure({
  figure,
  id,
}: {
  figure: WorkedFigure;
  id: string;
}) {
  if (figure.kind === "graph")
    return (
      <ProblemAbstractGraph
        check={figure.check}
        id={id}
        title={figure.title}
        activeEdges={figure.activeEdges}
      />
    );
  if (figure.kind === "circuit")
    return <ProblemSchematic network={figure.network} title={figure.title} />;
  if (figure.kind === "phasor")
    return (
      <ProblemPhasorDiagram
        group={{
          ...figure.group,
          caption: figure.group.caption || figure.title,
        }}
        id={id}
      />
    );
  const points = figure.series.flatMap((series) => series.points);
  const xs = points.map((point) => point[0]),
    ys = points.map((point) => point[1]);
  const minX = Math.min(0, ...xs),
    maxX = Math.max(...xs) > minX ? Math.max(...xs) : minX + 1;
  const minY = figure.yDomain?.[0] ?? Math.min(0, ...ys),
    maxY =
      figure.yDomain?.[1] ??
      (Math.max(0, ...ys) > minY ? Math.max(0, ...ys) : minY + 1);
  const tick = (value: number) =>
    value === 0
      ? "0"
      : Math.abs(value) >= 10000 || Math.abs(value) < 0.001
        ? value.toExponential(2)
        : String(Number(value.toPrecision(4)));
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
          {minY < 0 && maxY > 0 && (
            <g>
              <path
                d={`M70 ${y(0)}H625`}
                fill="none"
                stroke="var(--border)"
                strokeDasharray="3 5"
              />
              {y(0) > 95 && y(0) < 240 && (
                <text
                  x="58"
                  y={y(0) + 4}
                  style={{ textAnchor: "end", fontSize: 13 }}
                >
                  0
                </text>
              )}
            </g>
          )}
          <text x="75" y="30" style={{ textAnchor: "start" }}>
            {figure.yLabel}
          </text>
          <text x="640" y="325">
            {figure.xLabel}
          </text>
          <text x="62" y="303">
            {tick(minX)}
          </text>
          <text x="610" y="303">
            {tick(maxX)}
          </text>
          <text x="58" y="75" style={{ textAnchor: "end", fontSize: 13 }}>
            {tick(maxY)}
          </text>
          <text x="58" y="265" style={{ textAnchor: "end", fontSize: 13 }}>
            {tick(minY)}
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
                strokeDasharray={[undefined, "7 5", "2 5"][i]}
              />
            </g>
          ))}
        </svg>
      </div>
      <ul className="worked-plot-legend" aria-label="曲线图例">
        {figure.series.map((series, i) => (
          <li key={series.label}>
            {["实线", "长虚线", "点线"][i]}：{series.label}
          </li>
        ))}
      </ul>
      <figcaption>{figure.title}</figcaption>
    </figure>
  );
}
