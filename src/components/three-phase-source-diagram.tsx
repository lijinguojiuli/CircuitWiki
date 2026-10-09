import { Node } from "./circuit-symbols";
function SourceEdge({
  from,
  to,
  label,
  labelAt,
}: {
  from: [number, number];
  to: [number, number];
  label: string;
  labelAt: [number, number];
}) {
  const dx = to[0] - from[0],
    dy = to[1] - from[1],
    length = Math.hypot(dx, dy);
  const mx = (from[0] + to[0]) / 2,
    my = (from[1] + to[1]) / 2,
    ex = dx / length,
    ey = dy / length,
    px = -ey,
    py = ex;
  return (
    <g data-symbol="voltage-source">
      <path d={`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`} />
      <circle cx={mx} cy={my} r="24" />
      <text x={mx + 30 * ex + 12 * px} y={my + 30 * ey + 12 * py + 5}>
        +
      </text>
      <text x={mx - 30 * ex + 12 * px} y={my - 30 * ey + 12 * py + 5}>
        −
      </text>
      <text x={labelAt[0]} y={labelAt[1]}>
        {label}
      </text>
    </g>
  );
}
export function ThreePhaseSourceDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 680 300"
        role="img"
        aria-label="三相电源的星形与三角形连接"
      >
        <title>Y与Δ电源接法对照</title>
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <text x="160" y="25">
            Y形电源
          </text>
          <text x="510" y="25">
            Δ形电源
          </text>
          <SourceEdge
            from={[160, 155]}
            to={[160, 55]}
            label="U̇A"
            labelAt={[112, 105]}
          />
          <SourceEdge
            from={[160, 155]}
            to={[255, 245]}
            label="U̇B"
            labelAt={[235, 175]}
          />
          <SourceEdge
            from={[160, 155]}
            to={[65, 245]}
            label="U̇C"
            labelAt={[83, 175]}
          />
          <Node x={160} y={55} label="A" />
          <Node x={255} y={245} label="B" />
          <Node x={65} y={245} label="C" />
          <Node x={160} y={155} />
          <text x="185" y="155">
            N
          </text>
          <SourceEdge
            from={[605, 245]}
            to={[510, 55]}
            label="U̇AB"
            labelAt={[595, 135]}
          />
          <SourceEdge
            from={[415, 245]}
            to={[605, 245]}
            label="U̇BC"
            labelAt={[510, 292]}
          />
          <SourceEdge
            from={[510, 55]}
            to={[415, 245]}
            label="U̇CA"
            labelAt={[420, 135]}
          />
          <Node x={510} y={55} label="A" />
          <Node x={605} y={245} label="B" />
          <Node x={415} y={245} label="C" />
        </g>
      </svg>
      <figcaption>
        Y电源有公共中性点N；Δ电源三相依次首尾相连，端口相电压就是线电压。理想对称Δ电源沿闭环的电压代数和为0。
      </figcaption>
    </figure>
  );
}
