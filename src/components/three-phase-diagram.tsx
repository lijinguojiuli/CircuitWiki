import { Resistor, VoltageSource, Node } from "./circuit-symbols";
import { ImpedanceEdge } from "./star-delta-diagram";
export function ThreePhaseDiagram({
  neutral = true,
  unbalanced = false,
  connection = "star",
}: {
  neutral?: boolean;
  unbalanced?: boolean;
  connection?: "star" | "delta";
}) {
  if (connection === "delta")
    return (
      <figure className="circuit">
        <svg
          viewBox="0 0 640 330"
          role="img"
          aria-label="三相星形电源连接三角形负载"
        >
          <title>三相Y-Δ连接</title>
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M65 65V245" />
            {[65, 155, 245].map((y, index) => (
              <g key={y}>
                <path
                  d={`M65 ${y}h56m48 0h36m90 0H${index === 1 ? 420 : 525}`}
                />
                <VoltageSource x={145} y={y} label="" horizontal />
                <text x="145" y={y - 28}>
                  {["U̇A", "U̇B", "U̇C"][index]}
                </text>
                <Resistor x={205} y={y} label="Zₗ" />
              </g>
            ))}
            <ImpedanceEdge
              from={[525, 65]}
              to={[420, 155]}
              label="Z_AB"
              offset={[-25, -14]}
            />
            <ImpedanceEdge
              from={[420, 155]}
              to={[525, 245]}
              label="Z_BC"
              offset={[-25, 25]}
            />
            <ImpedanceEdge
              from={[525, 245]}
              to={[525, 65]}
              label="Z_CA"
              offset={[42, 5]}
            />
            <Node x={525} y={65} label="A′" />
            <Node x={420} y={155} label="B′" />
            <Node x={525} y={245} label="C′" />
            <Node x={65} y={155} />
            <text x="40" y="160">
              N
            </text>
            <text x="460" y="295">
              Δ负载无中性点
            </text>
          </g>
        </svg>
        <figcaption>
          左侧为Y连接电源，右侧三条阻抗依次接在A′B′、B′C′、C′A′之间，构成Δ负载。线电流是相邻支路电流的相量差。
        </figcaption>
      </figure>
    );
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 600 330"
        role="img"
        aria-label={`${unbalanced ? "不对称" : "对称"}三相星形负载${neutral ? "，接中性线" : "，中性线断开"}`}
      >
        <title>三相 Y-Y 连接</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M65 65V245M525 65V245" />
          {[65, 155, 245].map((y, i) => (
            <g key={y}>
              <path d={`M65 ${y}h56m48 0h36m90 0h35m90 0h105`} />
              <VoltageSource x={145} y={y} label="" horizontal />
              <text x="145" y={y - 28}>
                {["U̇A", "U̇B", "U̇C"][i]}
              </text>
              <Resistor x={205} y={y} label="Zₗ" />
              <Resistor
                x={330}
                y={y}
                label={unbalanced ? ["Z_A", "Z_B", "Z_C"][i] : "Z"}
              />
              <Node x={305} y={y} label={["A′", "B′", "C′"][i]} />
            </g>
          ))}
          <Node x={65} y={155} />
          <text x="40" y="160">
            N
          </text>
          <Node x={525} y={155} />
          <text x="552" y="160">
            N′
          </text>
          {neutral ? (
            <>
              <path d="M65 245v48H210m90 0h225v-48" />
              <Resistor x={210} y={293} label="Z_N" />
            </>
          ) : (
            <>
              <path d="M65 245v48H270m50 0h205v-48" />
              <path d="M270 293l42 -10" />
              <text x="296" y="320">
                中性线断开
              </text>
            </>
          )}
        </g>
      </svg>
      <figcaption>
        Zₗ 为各相线路阻抗，Z 为每相负载阻抗；N 与 N′
        分别是电源和负载中性点。圆圈为教材电压源符号。
      </figcaption>
    </figure>
  );
}
