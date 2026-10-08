import { Node } from "./circuit-symbols";
function Edge({
  from,
  to,
  label,
  offset,
}: {
  from: [number, number];
  to: [number, number];
  label: string;
  offset?: [number, number];
}) {
  const dx = to[0] - from[0],
    dy = to[1] - from[1],
    length = Math.hypot(dx, dy),
    angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const middle = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  return (
    <g>
      <g transform={`translate(${from[0]} ${from[1]}) rotate(${angle})`}>
        <path d={`M0 0H${length / 2 - 17}m34 0H${length}`} />
        <rect x={length / 2 - 17} y={-8} width={34} height={16} />
      </g>
      <text
        x={middle[0] + (offset?.[0] ?? (Math.abs(dx) < 10 ? 32 : 0))}
        y={middle[1] + (offset?.[1] ?? (Math.abs(dx) < 10 ? 5 : -15))}
      >
        {label.split("_")[0]}
        {label.includes("_") && (
          <tspan baselineShift="sub" fontSize="11">
            {label.split("_")[1]}
          </tspan>
        )}
      </text>
    </g>
  );
}
export function StarDeltaDiagram({
  impedance = false,
}: {
  impedance?: boolean;
}) {
  const unit = impedance ? "Z" : "R",
    terminals = impedance ? ["A", "B", "C"] : ["1", "2", "3"];
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 660 280"
        role="img"
        aria-label={impedance ? "星形与三角形三相负载" : "星形与三角形电阻网络"}
      >
        <title>Y 与 Δ 连接</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <text x="155" y="24">
            Y 形（星形）
          </text>
          <text x="505" y="24">
            Δ 形（三角形）
          </text>
          <Edge
            from={[155, 55]}
            to={[155, 145]}
            label={impedance ? "Z_A" : "R₁"}
          />
          <Edge
            from={[155, 145]}
            to={[260, 225]}
            label={impedance ? "Z_B" : "R₂"}
          />
          <Edge
            from={[155, 145]}
            to={[50, 225]}
            label={impedance ? "Z_C" : "R₃"}
          />
          <Node x={155} y={55} label={terminals[0]} />
          <Node x={260} y={225} label={terminals[1]} />
          <Node x={50} y={225} label={terminals[2]} />
          <Node x={155} y={145} />
          <text x="185" y="145">
            {impedance ? "N′" : "O"}
          </text>
          <Edge
            from={[505, 55]}
            to={[610, 225]}
            label={`${unit}₁₂`}
            offset={[24, -6]}
          />
          <Edge from={[610, 225]} to={[400, 225]} label={`${unit}₂₃`} />
          <Edge
            from={[400, 225]}
            to={[505, 55]}
            label={`${unit}₃₁`}
            offset={[-24, -6]}
          />
          <Node x={505} y={55} label={terminals[0]} />
          <Node x={610} y={225} label={terminals[1]} />
          <Node x={400} y={225} label={terminals[2]} />
          <text x="330" y="147">
            ⇄
          </text>
        </g>
      </svg>
      <figcaption>
        {impedance
          ? "三相负载连接示意，Δ 支路 Z₁₂、Z₂₃、Z₃₁ 分别对应 AB、BC、CA。"
          : "同名端子 1、2、3 一一对应；等效前后外部端口关系保持一致。"}
      </figcaption>
    </figure>
  );
}
