import { useId, type SVGProps } from "react";
import {
  componentTerminals,
  componentDefinitions,
  formatComponentValue,
} from "@/lib/circuit-equations/model";
import { BOARD } from "@/lib/circuit-equations/geometry";
import { nodeLabelPositions } from "@/lib/circuit-equations/labels";
import type {
  CircuitDocument,
  EditorSelection,
  Point,
} from "@/lib/circuit-equations/types";
import type { Topology, Mesh } from "@/lib/circuit-equations/topology";
import styles from "./workspace.module.css";

type Props = {
  document: CircuitDocument;
  topology: Topology;
  selection?: EditorSelection;
  zoom?: number;
  snapshot?: boolean;
  showDirections?: boolean;
  showNodes?: boolean;
  meshes?: Mesh[];
  referenceOnly?: boolean;
  wirePreview?: Point[];
  onChoose?: (s: EditorSelection) => void;
  onPin?: (p: Point) => void;
} & SVGProps<SVGSVGElement>;
export function CircuitDrawing({
  document: doc,
  topology,
  selection = null,
  zoom = 1,
  snapshot = false,
  showDirections = true,
  showNodes = true,
  meshes = [],
  referenceOnly = false,
  wirePreview = [],
  onChoose,
  onPin,
  ...events
}: Props) {
  const pattern = useId();
  const labels = nodeLabelPositions(doc, topology);
  const points = [
    ...doc.wires.flatMap((w) => w.points),
    ...doc.components.flatMap(
      (c) =>
        [
          [c.position[0] - 160, c.position[1] - 70],
          [c.position[0] + 160, c.position[1] + 80],
        ] as Point[],
    ),
    ...doc.grounds.map(
      (g) => [g.position[0] + 75, g.position[1] + 40] as Point,
    ),
    ...labels.map((n) => n.position),
  ];
  const minX = Math.max(0, Math.min(...points.map((p) => p[0])) - 20),
    minY = Math.max(0, Math.min(...points.map((p) => p[1])) - 20),
    maxX = Math.max(...points.map((p) => p[0])) + 20,
    maxY = Math.max(...points.map((p) => p[1])) + 20;
  return (
    <svg
      {...events}
      viewBox={
        snapshot && points.length
          ? `${minX} ${minY} ${Math.max(320, maxX - minX)} ${Math.max(180, maxY - minY)}`
          : `0 0 ${BOARD.width} ${BOARD.height}`
      }
      className={styles.drawing}
      style={
        snapshot ? undefined : { width: `${zoom * 100}%`, minWidth: 760 * zoom }
      }
      role="group"
      aria-label={`${doc.title}电路画板`}
    >
      <title>{doc.title}</title>
      <desc>
        端子圆环可开始连线；实心圆点表示连接。电流源箭头从端子1指向端子2，电压源端子1为正。
      </desc>
      <defs>
        <pattern
          id={pattern}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".7" fill="var(--border)" />
        </pattern>
      </defs>
      {!snapshot && (
        <rect
          width={BOARD.width}
          height={BOARD.height}
          fill={`url(#${pattern})`}
        />
      )}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        {doc.wires.map((w) => (
          <g key={w.id}>
            <path
              d={w.points
                .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
                .join(" ")}
              strokeWidth={
                selection?.kind === "wire" && selection.id === w.id ? 4 : 1.8
              }
            />
            {!snapshot && (
              <path
                data-wire-id={w.id}
                d={w.points
                  .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
                  .join(" ")}
                stroke="transparent"
                strokeWidth="16"
                className={styles.wireHit}
              />
            )}
          </g>
        ))}
        {doc.components.map((c) => {
          const [x, y] = c.position,
            vertical = c.rotation === 90 || c.rotation === 270,
            selected = selection?.kind === "component" && selection.id === c.id,
            pins = componentTerminals(c);
          return (
            <g
              key={c.id}
              data-component-id={c.id}
              className={styles.glyph}
              role={snapshot ? undefined : "button"}
              tabIndex={snapshot ? undefined : 0}
              aria-label={
                snapshot
                  ? undefined
                  : `选择 ${c.id} ${componentDefinitions[c.type].label}`
              }
              aria-pressed={snapshot ? undefined : selected}
              onKeyDown={(e) => {
                if (!snapshot && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  e.stopPropagation();
                  onChoose?.({ kind: "component", id: c.id });
                }
              }}
            >
              <g transform={`translate(${x} ${y}) rotate(${c.rotation})`}>
                {!snapshot && (
                  <rect
                    x="-56"
                    y="-22"
                    width="112"
                    height="44"
                    rx="6"
                    fill="transparent"
                    stroke={selected ? "var(--muted)" : "none"}
                    strokeWidth="1"
                    className={styles.selectionBox}
                  />
                )}
                {c.type === "resistor" ? (
                  <>
                    <path d="M-40 0H-24M24 0H40" />
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      fill="var(--surface)"
                    />
                    {showDirections && (
                      <>
                        <path d="M-12 29H9" strokeWidth="1.2" />
                        <path
                          d="M14 29l-7 -4v8z"
                          fill="currentColor"
                          stroke="none"
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <path d="M-40 0H-18M18 0H40" />
                    <circle r="18" fill="var(--surface)" />
                    {c.type === "voltage-source" ? (
                      <path d="M-18 0H18" />
                    ) : (
                      <>
                        <path d="M0 -18V18M-13 -29H9" />
                        <path
                          d="M14 -29l-7 -4v8z"
                          fill="currentColor"
                          stroke="none"
                        />
                      </>
                    )}
                  </>
                )}
              </g>
              {c.type === "voltage-source" &&
                pins.map(([px, py], i) => (
                  <text
                    key={i}
                    x={vertical ? x - 31 : x + (px < x ? -29 : 29)}
                    y={vertical ? y + (py < y ? -10 : 20) : y + 43}
                    textAnchor="middle"
                    className={styles.polarity}
                  >
                    {i ? "−" : "+"}
                  </text>
                ))}
              <text
                x={vertical ? x + (x > 800 ? -47 : 47) : x}
                y={vertical ? y - 4 : y - 34}
                textAnchor={vertical ? (x > 800 ? "end" : "start") : "middle"}
                className={styles.componentId}
              >
                {c.id}
                {!vertical && (
                  <tspan className={styles.componentValue}>
                    {" "}
                    · {formatComponentValue(c)}
                  </tspan>
                )}
              </text>
              {vertical && (
                <text
                  x={x + (x > 800 ? -47 : 47)}
                  y={y + 17}
                  textAnchor={x > 800 ? "end" : "start"}
                  className={styles.componentValue}
                >
                  {formatComponentValue(c)}
                </text>
              )}
              {pins.map(([px, py], i) => (
                <g key={i}>
                  <circle cx={px} cy={py} r={3} fill="var(--surface)" />
                  {!snapshot && (
                    <circle
                      data-component-id={c.id}
                      data-pin-index={i}
                      cx={px}
                      cy={py}
                      r={11}
                      fill="transparent"
                      stroke="none"
                      role="button"
                      tabIndex={0}
                      aria-label={`连接 ${c.id} 端子${i + 1}`}
                      className={styles.pinHit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onPin?.([px, py]);
                        }
                      }}
                    />
                  )}
                </g>
              ))}
            </g>
          );
        })}
        {[...topology.junctions, ...doc.junctions].map(([x, y], i) => (
          <circle
            key={`j${i}`}
            cx={x}
            cy={y}
            r="3.5"
            fill="currentColor"
            stroke="none"
            pointerEvents="none"
          />
        ))}
        {doc.grounds.map((g) => {
          const [x, y] = g.position;
          return (
            <g
              key={g.id}
              data-ground-id={g.id}
              role={snapshot ? undefined : "button"}
              tabIndex={snapshot ? undefined : 0}
              aria-label={snapshot ? undefined : `选择接地 ${g.id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  onChoose?.({ kind: "ground", id: g.id });
                }
              }}
            >
              {!snapshot && (
                <rect
                  x={x - 25}
                  y={y - 8}
                  width="70"
                  height="40"
                  rx="4"
                  fill="transparent"
                  stroke={
                    selection?.kind === "ground" && selection.id === g.id
                      ? "var(--border)"
                      : "none"
                  }
                />
              )}
              <path d={`M${x} ${y}v10m-15 0h30m-5 7h-20m5 7h10`} />
              <text
                x={x + (x > 900 ? -45 : 45)}
                y={y + 21}
                textAnchor={x > 900 ? "end" : "start"}
                className={styles.componentValue}
              >
                0 V
              </text>
            </g>
          );
        })}
        {meshes
          .filter((m) => m.labelVisible !== false)
          .map((m) => (
            <g key={m.name} className={styles.meshMarker} pointerEvents="none">
              <path
                d={`M${m.center[0] + 25} ${m.center[1]}a25 18 0 1 1 -25 -18`}
                strokeWidth="1.2"
              />
              <path
                d={`M${m.center[0]} ${m.center[1] - 18}l-7 -4v8z`}
                fill="currentColor"
                stroke="none"
              />
              <text x={m.center[0]} y={m.center[1] + 5} textAnchor="middle">
                {m.name}
              </text>
            </g>
          ))}
        {!!wirePreview.length && (
          <path
            d={wirePreview
              .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
              .join(" ")}
            strokeDasharray="5 4"
            strokeWidth="2"
            pointerEvents="none"
          />
        )}
      </g>
      {showNodes &&
        labels.map((n) => (
          <g key={n.id} pointerEvents="none">
            {referenceOnly && n.id === "N0" && (
              <circle
                cx={topology.positions.find((p) => p.id === n.id)!.position[0]}
                cy={topology.positions.find((p) => p.id === n.id)!.position[1]}
                r="12"
                fill="none"
                stroke="currentColor"
              />
            )}
            <text
              x={n.position[0]}
              y={n.position[1]}
              className={styles.nodeLabel}
              textAnchor="middle"
            >
              {n.id}
            </text>
          </g>
        ))}
    </svg>
  );
}
