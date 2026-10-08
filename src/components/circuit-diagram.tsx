import {
  Resistor,
  Capacitor,
  Inductor,
  VoltageSource,
  CurrentSource,
  Ground,
  Node,
} from "./circuit-symbols";
export {
  Wire,
  Resistor,
  Capacitor,
  Inductor,
  VoltageSource,
  CurrentSource,
  Ground,
  Node,
} from "./circuit-symbols";
export type CircuitKind =
  "divider" | "rc" | "thevenin" | "nodal" | "mesh" | "rl";
export function CircuitDiagram({
  type = "divider",
  caption,
  sourceLabel,
}: {
  type?: CircuitKind;
  caption?: string;
  sourceLabel?: string;
}) {
  const rc = type === "rc",
    rl = type === "rl",
    nodal = type === "nodal",
    mesh = type === "mesh";
  const names = {
    divider: "电阻分压电路",
    rc: "串联 RC 充电电路",
    thevenin: "戴维南等效电路",
    nodal: "单节点分析电路",
    mesh: "双网孔分析电路",
    rl: "串联 RL 电路",
  };
  return (
    <figure className="circuit">
      <svg viewBox="0 0 560 250" role="img" aria-label={names[type]}>
        <title>{names[type]}</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M95 106V60h65m90 0h75v35m0 90v25H95v-56" />
          <VoltageSource
            x={95}
            y={130}
            label={
              sourceLabel ??
              (type === "thevenin" ? "u_oc" : type === "mesh" ? "u_S1" : "U_S")
            }
          />
          <Resistor
            x={160}
            y={60}
            label={type === "thevenin" ? "R_eq" : "R₁"}
          />
          <g transform="translate(325 95) rotate(90)">
            {rc ? (
              <Capacitor x={0} y={0} label="" />
            ) : rl ? (
              <Inductor x={0} y={0} label="" />
            ) : (
              <Resistor x={0} y={0} label="" />
            )}
          </g>
          <text x="365" y="145">
            {rc ? "C" : rl ? "L" : type === "thevenin" ? "R_L" : "R₂"}
          </text>
          <Node x={325} y={60} label="A" />
          <Node x={325} y={210} />
          <Ground x={325} y={210} />
          {nodal || mesh ? (
            <>
              <path d="M325 60h35m90 0h35v46m0 48v56H325" />
              <Resistor x={360} y={60} label="R₃" />
              {mesh ? (
                <VoltageSource x={485} y={130} label="u_S3" />
              ) : (
                <CurrentSource x={485} y={130} label="I_S" />
              )}
            </>
          ) : (
            <>
              <path strokeDasharray="4 5" d="M415 86v95" />
              <text x="444" y="132">
                {rc ? "uC" : "u"}
              </text>
              <text x="414" y="72">
                +
              </text>
              <text x="414" y="204">
                −
              </text>
            </>
          )}
        </g>
      </svg>
      <figcaption>
        {caption ?? names[type]} · 电压、电流均须先指定参考方向
      </figcaption>
    </figure>
  );
}
