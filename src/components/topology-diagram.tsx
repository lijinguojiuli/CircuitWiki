export function TopologyDiagram() {
  const nodes = [
    { n: 1, x: 90, y: 65 },
    { n: 2, x: 440, y: 65 },
    { n: 3, x: 440, y: 235 },
    { n: 4, x: 90, y: 235 },
  ];
  return (
    <figure className="circuit topology-diagram">
      <svg
        viewBox="0 0 530 295"
        role="img"
        aria-label="四个结点、五条支路、两个网孔的电路图"
      >
        <title>结点、支路与回路编号示意</title>
        <g stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M90 65H440V235H90Z" />
          <path d="M90 65L440 235" strokeDasharray="6 4" />
          {nodes.map(({ n, x, y }) => (
            <g key={n}>
              <circle cx={x} cy={y} r="5" fill="currentColor" />
              <text x={x} y={y === 65 ? y - 20 : y + 27}>
                结点 {n}
              </text>
            </g>
          ))}
          <text x="265" y="49">
            支路 b₁
          </text>
          <text x="485" y="154">
            b₂
          </text>
          <text x="265" y="262">
            b₃
          </text>
          <text x="50" y="154">
            b₄
          </text>
          <text x="280" y="139">
            b₅
          </text>
        </g>
      </svg>
      <figcaption>
        只保留连接关系的图：4 个结点，5 条支路；虚线 b₅ 是实际支路的抽象表示。
      </figcaption>
    </figure>
  );
}
