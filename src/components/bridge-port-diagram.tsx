import {
  Resistor,
  VoltageSource,
  CurrentSource,
  Node,
  Ground,
} from "./circuit-symbols";
export type BridgeMode = "open" | "short" | "loaded" | "resistance";
export function BridgePortDiagram({ mode = "open" }: { mode?: BridgeMode }) {
  const off = mode === "resistance";
  return (
    <figure className="circuit bridge-port-diagram">
      <svg
        viewBox="0 0 650 335"
        role="img"
        aria-label={`桥臂式含源一端口，${{ open: "端口开路", short: "端口短路", loaded: "接入负载", resistance: "独立源置零求输入电阻" }[mode]}`}
      >
        <title>桥臂式含源一端口电路</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M100 80h120v75h61m48 0h111V80h130M220 80h35m90 0h95M100 80v180h156m48 0h266" />
          <Resistor x={255} y={80} label="R" />
          {off ? (
            <>
              <circle cx="281" cy="155" r="3" />
              <circle cx="329" cy="155" r="3" />
              <text x="305" y="199">
                IS=0，开路
              </text>
              <path d="M256 260h48" />
              <text x="280" y="298">
                US=0，短路
              </text>
            </>
          ) : (
            <>
              <CurrentSource x={305} y={155} horizontal />
              <VoltageSource x={280} y={260} label="" horizontal reverse />
              <text x="280" y="300">
                US：左正、右负
              </text>
            </>
          )}
          <Node x={100} y={80} label="X" />
          <Node x={440} y={80} />
          <Node x={570} y={80} label="A" />
          <Node x={570} y={260} />
          <text x="540" y="285">
            B
          </text>
          <Ground x={570} y={260} />
          {mode === "short" && (
            <>
              <path d="M570 80v180M594 120v35" />
              <path d="M594 160l-4 -8h8z" fill="currentColor" stroke="none" />
              <text x="613" y="185">
                isc
              </text>
            </>
          )}
          {mode === "loaded" && (
            <>
              <path d="M570 80v55m0 90v35" />
              <g transform="translate(570 135) rotate(90)">
                <Resistor x={0} y={0} label="" />
              </g>
              <text x="613" y="185">
                RL
              </text>
            </>
          )}
        </g>
      </svg>
      <figcaption>
        上方 R 与 IS 并联，整体与下方 US 构成一端口。IS 方向 X→A；B 为参考结点。
        {off ? "置零后只有R对端口起作用。" : "端口电压取A对B，负载电流取A→B。"}
      </figcaption>
    </figure>
  );
}
