import {
  Resistor,
  Inductor,
  Capacitor,
  VoltageSource,
  Ground,
  Node,
} from "./circuit-symbols";

export function ResonanceDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 560 280"
        role="img"
        aria-label="正弦电源驱动的RLC串联谐振电路"
      >
        <title>RLC串联谐振电路</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M85 116V60h45m90 0h40m90 0h75v40m0 90v40H85v-66" />
          <VoltageSource x={85} y={140} label="u_S" />
          <Resistor x={130} y={60} label="R" />
          <Inductor x={260} y={60} label="L" />
          <g transform="translate(425 100) rotate(90)">
            <Capacitor x={0} y={0} label="" />
          </g>
          <text x="465" y="150">
            C
          </text>
          <Node x={425} y={230} />
          <Ground x={425} y={230} />
        </g>
      </svg>
      <figcaption>
        R、L、C串联，同一电流流经三个元件；谐振时感抗与容抗抵消，输入阻抗为R。
      </figcaption>
    </figure>
  );
}

export function ParallelResonanceDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 580 280"
        role="img"
        aria-label="电阻、电感、电容并联的谐振电路"
      >
        <title>RLC并联谐振电路</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M80 116V55H470v50m0 90v40H80v-71M225 55v50m0 90v40M350 55v50m0 90v40" />
          <VoltageSource x={80} y={140} label="u_S" />
          <g transform="translate(225 105) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="285" y="150">
            R=1/G
          </text>
          <g transform="translate(350 105) rotate(90)">
            <Inductor x={0} y={0} label="" />
          </g>
          <text x="375" y="150">
            L
          </text>
          <g transform="translate(470 105) rotate(90)">
            <Capacitor x={0} y={0} label="" />
          </g>
          <text x="510" y="150">
            C
          </text>
          <Node x={470} y={235} />
          <Ground x={470} y={235} />
        </g>
      </svg>
      <figcaption>
        理想G、L、C并联。谐振时IL与IC相互抵消，源侧电流仅为电阻电流；此结论须与具体损耗模型一起使用。
      </figcaption>
    </figure>
  );
}
