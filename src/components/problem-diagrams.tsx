import { Ground, Node } from "./circuit-symbols";
import type {
  ProblemNetwork,
  ProblemPhasors,
  ProblemCheck,
} from "@/lib/challenges/types";

export function ProblemAbstractGraph({
  check,
  id,
}: {
  check: Extract<ProblemCheck, { kind: "graph" }>;
  id: string;
}) {
  const positions: Record<string, [number, number]> =
    check.nodes.length === 5
      ? {
          "0": [90, 250],
          "1": [90, 70],
          "2": [330, 70],
          "3": [570, 70],
          "4": [570, 250],
        }
      : { "0": [90, 250], "1": [90, 70], "2": [570, 70], "3": [570, 250] };
  return (
    <figure className="circuit problem-schematic">
      <svg viewBox="0 0 660 330" role="img" aria-label={`§${id}提高题的有向图`}>
        <defs>
          <marker
            id={`graph-arrow-${id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        {check.edges.map(([from, to], index) => {
          const [x1, y1] = positions[from],
            [x2, y2] = positions[to];
          const length = Math.hypot(x2 - x1, y2 - y1);
          const dx = (x2 - x1) / length,
            dy = (y2 - y1) / length;
          const curved = check.nodes.length === 5 && index === 5;
          return (
            <g
              key={index}
              fill="none"
              stroke="currentColor"
              strokeWidth={index < check.nodes.length - 1 ? 2.5 : 1.5}
            >
              <path
                d={
                  curved
                    ? `M${x1 + 13} ${y1 - 4}Q330 -6 ${x2 - 13} ${y2 - 4}`
                    : `M${x1 + 14 * dx} ${y1 + 14 * dy}L${x2 - 14 * dx} ${y2 - 14 * dy}`
                }
                markerEnd={`url(#graph-arrow-${id})`}
              />
              <text
                x={curved ? 330 : (x1 + x2) / 2 + -dy * 17}
                y={curved ? 14 : (y1 + y2) / 2 + dx * 17}
                fill="currentColor"
                stroke="none"
                fontSize="15"
              >
                e{index + 1}
              </text>
            </g>
          );
        })}
        {check.nodes.map((node) => (
          <g key={node}>
            <circle
              cx={positions[node][0]}
              cy={positions[node][1]}
              r="14"
              fill="var(--surface)"
              stroke="currentColor"
              strokeWidth="2"
            />
            <text
              x={positions[node][0]}
              y={positions[node][1] + 5}
              textAnchor="middle"
              fill="currentColor"
              fontSize="15"
            >
              {node}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        箭头为支路参考方向；较粗支路构成所选树，其他支路为连支。未标结点的交叉不表示连接。
        <span className="diagram-pan-hint">窄屏可左右滑动查看完整图。</span>
      </figcaption>
    </figure>
  );
}

export function ProblemSchematic({
  network,
  title,
}: {
  network: ProblemNetwork;
  title: string;
}) {
  return (
    <figure className="circuit problem-schematic">
      <svg
        viewBox="0 0 760 390"
        role="img"
        aria-label={`${title}的结点与支路连接图`}
      >
        <title>{title}</title>
        <g
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        >
          {network.branches.map((branch, index) => {
            const from = network.nodes.find((node) => node.id === branch.from)!;
            const to = network.nodes.find((node) => node.id === branch.to)!;
            const points = [
              [from.x, from.y],
              ...(branch.via ?? []),
              [to.x, to.y],
            ];
            const segments = points.slice(1).map((point, i) => ({
              a: points[i],
              b: point,
              length: Math.hypot(
                point[0] - points[i][0],
                point[1] - points[i][1],
              ),
            }));
            const segment =
              branch.symbolSegment !== undefined
                ? segments[branch.symbolSegment]
                : segments.reduce((best, item) =>
                    item.length > best.length ? item : best,
                  );
            const x = (segment.a[0] + segment.b[0]) / 2,
              y = (segment.a[1] + segment.b[1]) / 2;
            const angle =
              (Math.atan2(
                segment.b[1] - segment.a[1],
                segment.b[0] - segment.a[0],
              ) *
                180) /
              Math.PI;
            const dx = Math.cos((angle * Math.PI) / 180),
              dy = Math.sin((angle * Math.PI) / 180);
            const vertical =
              Math.abs(segment.b[1] - segment.a[1]) >
              Math.abs(segment.b[0] - segment.a[0]);
            const polaritySide = vertical
              ? Math.sign(dy) || 1
              : Math.sign(dx) || 1;
            const labelOnLeft =
              x > (branch.kind === "controlled-current" ? 570 : 470) &&
              branch.kind !== "voltage";
            const labelX =
              (vertical ? x + (labelOnLeft ? -38 : 38) : x) +
              (branch.labelOffset?.[0] ?? 0);
            return (
              <g key={index}>
                <path
                  d={points
                    .map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`)
                    .join(" ")}
                />
                <g transform={`translate(${x} ${y}) rotate(${angle})`}>
                  {(branch.kind === "resistor" ||
                    branch.kind === "impedance") && (
                    <rect
                      x="-25"
                      y="-10"
                      width="50"
                      height="20"
                      fill="var(--surface)"
                    />
                  )}
                  {branch.kind === "element" && (
                    <rect
                      x="-40"
                      y="-30"
                      width="80"
                      height="60"
                      fill="var(--surface)"
                    />
                  )}
                  {branch.kind === "capacitor" && (
                    <>
                      <rect
                        x="-9"
                        y="-22"
                        width="18"
                        height="44"
                        fill="var(--surface)"
                        stroke="none"
                      />
                      <path d="M-7 -20v40M7 -20v40" />
                    </>
                  )}
                  {branch.kind === "inductor" && (
                    <>
                      <rect
                        x="-26"
                        y="-12"
                        width="52"
                        height="24"
                        fill="var(--surface)"
                        stroke="none"
                      />
                      <path d="M-24 0a6 9 0 0 1 12 0a6 9 0 0 1 12 0a6 9 0 0 1 12 0a6 9 0 0 1 12 0" />
                    </>
                  )}
                  {(branch.kind === "voltage" || branch.kind === "current") && (
                    <circle r="24" fill="var(--surface)" />
                  )}
                  {branch.kind === "controlled-current" && (
                    <path d="M-26 0L0 -20L26 0L0 20Z" fill="var(--surface)" />
                  )}
                  {branch.kind === "voltage" && <path d="M-24 0h48" />}
                  {(branch.kind === "current" ||
                    branch.kind === "controlled-current") && (
                    <>
                      <path d="M0 -20v40M32 -14h23" />
                      <path
                        d="M55 -14l-8 -4v8z"
                        fill="currentColor"
                        stroke="none"
                      />
                    </>
                  )}
                </g>
                {branch.kind === "voltage" && (
                  <g stroke="none" fill="currentColor" fontSize="15">
                    <text
                      x={x - 14 * dx - 32 * dy * polaritySide}
                      y={y - 14 * dy + 32 * dx * polaritySide + 5}
                    >
                      +
                    </text>
                    <text
                      x={x + 14 * dx - 32 * dy * polaritySide}
                      y={y + 14 * dy + 32 * dx * polaritySide + 5}
                    >
                      −
                    </text>
                  </g>
                )}
                <text
                  x={labelX}
                  y={
                    (vertical ? y + 4 : y - 32) + (branch.labelOffset?.[1] ?? 0)
                  }
                  style={{
                    textAnchor: vertical
                      ? labelOnLeft
                        ? "end"
                        : "start"
                      : "middle",
                  }}
                  fill="currentColor"
                  stroke="none"
                  fontSize="15"
                >
                  {branch.label}
                </text>
              </g>
            );
          })}
          {network.nodes.map((node) => (
            <Node
              key={node.id}
              x={node.x}
              y={node.y}
              label={node.id === network.ground ? "" : node.id}
              labelOffset={node.labelOffset}
            />
          ))}
          {network.arrows?.map((arrow, index) => {
            const dx = arrow.to[0] - arrow.from[0],
              dy = arrow.to[1] - arrow.from[1];
            const length = Math.hypot(dx, dy),
              angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const vertical = Math.abs(dy) > Math.abs(dx);
            return (
              <g key={`reference-${index}`}>
                <g
                  transform={`translate(${arrow.from[0]} ${arrow.from[1]}) rotate(${angle})`}
                >
                  <path d={`M0 0H${length}`} />
                  <path
                    d={`M${length} 0l-8 -4v8z`}
                    fill="currentColor"
                    stroke="none"
                  />
                </g>
                <text
                  x={(arrow.from[0] + arrow.to[0]) / 2 + (vertical ? 18 : 0)}
                  y={(arrow.from[1] + arrow.to[1]) / 2 + (vertical ? 4 : -12)}
                  style={{ textAnchor: vertical ? "start" : "middle" }}
                  fill="currentColor"
                  stroke="none"
                >
                  {arrow.label}
                </text>
              </g>
            );
          })}
          {network.notes?.map((note, index) =>
            note.text === "•" ? (
              <circle
                key={`note-${index}`}
                cx={note.x}
                cy={note.y - 5}
                r={3}
                fill="currentColor"
                stroke="none"
              />
            ) : (
              <text
                key={`note-${index}`}
                x={note.x}
                y={note.y}
                fill="currentColor"
                stroke="none"
              >
                {note.text}
              </text>
            ),
          )}
          {network.ground &&
            (() => {
              const node = network.nodes.find(
                (item) => item.id === network.ground,
              )!;
              return <Ground x={node.x} y={node.y} />;
            })()}
        </g>
      </svg>
      <figcaption>
        {network.caption ?? (
          <>
            箭头表示题设电流正方向，电压源按“+”“−”标注极性；
            {network.ground
              ? `结点${network.ground}为参考结点。`
              : "端口与参考方向以题干为准。"}
            全部数值与连接条件见题干。
          </>
        )}
        <span className="diagram-pan-hint">窄屏可左右滑动查看完整图。</span>
      </figcaption>
    </figure>
  );
}

export function ProblemPhasorDiagram({
  group,
  id,
}: {
  group: ProblemPhasors;
  id: string;
}) {
  const scale =
    140 /
    Math.max(
      1,
      ...group.vectors.map((vector) =>
        Math.max(Math.abs(vector.real), Math.abs(vector.imag)),
      ),
    );
  return (
    <figure className="circuit problem-phasor">
      <svg viewBox="0 0 400 340" role="img" aria-label={group.caption}>
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path d="M30 170H370M180 25V315" stroke="var(--border)" fill="none" />
        <text x="360" y="190">
          Re
        </text>
        <text x="160" y="20">
          Im
        </text>
        {group.vectors.map((vector, index) => (
          <g key={vector.label}>
            <line
              x1="180"
              y1="170"
              x2={180 + scale * vector.real}
              y2={170 - scale * vector.imag}
              stroke="currentColor"
              strokeWidth={index === group.vectors.length - 1 ? 3 : 1.5}
              markerEnd={`url(#arrow-${id})`}
            />
            <text
              x={190 + scale * vector.real}
              y={162 - scale * vector.imag}
              fontSize="14"
            >
              {vector.label}
            </text>
          </g>
        ))}
        <circle cx="180" cy="170" r="3" fill="currentColor" />
      </svg>
      <figcaption>
        {group.caption} · 单位 {group.unit}
        ；合成量用较粗箭头，同一量纲使用同一比例尺。
      </figcaption>
    </figure>
  );
}
