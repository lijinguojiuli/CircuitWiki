import {
  Resistor,
  Inductor,
  Capacitor,
  VoltageSource,
  Ground,
  Node,
} from "./circuit-symbols";
export function CompensationDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 580 340"
        role="img"
        aria-label="感性负载并联电容补偿功率因数"
      >
        <title>并联电容补偿感性负载</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M85 146V55H440v70m0 90v70H85v-91M270 55v20m0 180v30" />
          <VoltageSource x={85} y={170} label="u_S" />
          <g transform="translate(270 75) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="305" y="125">
            R
          </text>
          <g transform="translate(270 165) rotate(90)">
            <Inductor x={0} y={0} label="" />
          </g>
          <text x="305" y="215">
            L
          </text>
          <g transform="translate(440 125) rotate(90)">
            <Capacitor x={0} y={0} label="" />
          </g>
          <text x="480" y="175">
            C
          </text>
          <Node x={440} y={285} />
          <Ground x={440} y={285} />
          <text x="275" y="325">
            感性负载
          </text>
        </g>
      </svg>
      <figcaption>
        补偿电容与整个感性负载并联。它减少电源侧无功电流，不把原负载的电阻损耗或有功功率删掉。
      </figcaption>
    </figure>
  );
}
