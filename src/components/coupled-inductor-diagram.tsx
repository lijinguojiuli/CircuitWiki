import { Inductor } from "./circuit-symbols";

export function CoupledInductorDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 650 290"
        role="img"
        aria-label="两线圈的同名端都在上端，电流i1和i2均流入同名端"
      >
        <title>耦合电感的同名端与参考方向</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M140 95h90v15m0 90v25h-90M510 95h-90v15m0 90v25h90" />
          <g transform="translate(230 110) rotate(90)">
            <Inductor x={0} y={0} label="" />
          </g>
          <g transform="translate(420 110) rotate(90)">
            <Inductor x={0} y={0} label="" />
          </g>
          <circle cx="246" cy="120" r="4" fill="currentColor" />
          <circle cx="436" cy="120" r="4" fill="currentColor" />
          <path d="M160 75h35m295 0h-35" />
          <path
            d="M199 75l-8 -4v8zM451 75l8 -4v8z"
            fill="currentColor"
            stroke="none"
          />
          {[140, 510].map((x) => (
            <g key={x}>
              <circle cx={x} cy="95" r="3" />
              <circle cx={x} cy="225" r="3" />
            </g>
          ))}
          <text x="177" y="58">
            i₁
          </text>
          <text x="473" y="58">
            i₂
          </text>
          <text x="325" y="106">
            M
          </text>
          <text x="275" y="165">
            L₁
          </text>
          <text x="465" y="165">
            L₂
          </text>
          <text x="115" y="100">
            1
          </text>
          <text x="115" y="230">
            1′
          </text>
          <text x="535" y="100">
            2
          </text>
          <text x="535" y="230">
            2′
          </text>
          <text x="325" y="265">
            u₁取1对1′，u₂取2对2′；两电流均流入同名端
          </text>
        </g>
      </svg>
      <figcaption>
        黑点标记同名端。本图两电流均流入同名端，电压电流取关联参考方向，互感项取正号；两线圈没有直接导线连接。
      </figcaption>
    </figure>
  );
}
