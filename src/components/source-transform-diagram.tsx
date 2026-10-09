import {
  Resistor,
  VoltageSource,
  CurrentSource,
  Node,
} from "./circuit-symbols";
export function SourceTransformDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 680 320"
        role="img"
        aria-label="电压源串联电阻与电流源并联电阻的等效变换"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <text x="205" y="25">
            电压源模型
          </text>
          <path d="M110 146V75h35m90 0h55m-180 119v71h180" />
          <VoltageSource x={110} y={170} />
          <Resistor x={145} y={75} label="R" />
          <Node x={290} y={75} label="A" />
          <Node x={290} y={265} label="B" />
          <text x="310" y="95">
            +
          </text>
          <text x="310" y="265">
            −
          </text>
          <text x="345" y="177">
            ⇄
          </text>
          <text x="525" y="25">
            电流源模型
          </text>
          <path d="M440 146V75h170m-170 119v71h170M520 75v45m0 90v55" />
          <CurrentSource x={440} y={170} />
          <g transform="translate(520 120) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="555" y="177">
            R
          </text>
          <Node x={610} y={75} label="A" />
          <Node x={610} y={265} label="B" />
        </g>
      </svg>
      <figcaption>
        同名端口 A、B 对应；R 不变，IS=US/R。电流源方向由电压源负端指向正端。
      </figcaption>
    </figure>
  );
}
