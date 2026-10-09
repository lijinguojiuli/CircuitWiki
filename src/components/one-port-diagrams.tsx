import {
  Resistor,
  VoltageSource,
  CurrentSource,
  Node,
  Ground,
} from "./circuit-symbols";
export type DividerMode = "open" | "short" | "resistance" | "test";
export function DividerPortDiagram({ mode = "open" }: { mode?: DividerMode }) {
  const off = mode === "resistance" || mode === "test";
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 560 300"
        role="img"
        aria-label={`分压网络的${{ open: "端口开路", short: "端口短路", resistance: "独立源置零", test: "输入电阻测试" }[mode]}图`}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M120 126V70h70m90 0h55v35m0 90v50H120v-71M335 70h100M335 245h100" />
          {off ? (
            <>
              <path d="M120 126v48" />
              <text x="85" y="150">
                US=0
              </text>
            </>
          ) : (
            <VoltageSource x={120} y={150} />
          )}
          <Resistor x={190} y={70} label="R₁" />
          <g transform="translate(335 105) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="373" y="157">
            R₂
          </text>
          <Node x={335} y={70} />
          <Node x={335} y={245} />
          <Node x={435} y={70} label="A" />
          <Node x={435} y={245} />
          <text x="460" y="251">
            B
          </text>
          <Ground x={335} y={245} />
          {mode === "short" && (
            <>
              <path d="M435 70v175M457 106v38" />
              <path d="M457 148l-4 -8h8z" fill="currentColor" stroke="none" />
              <text x="482" y="173">
                i
                <tspan baselineShift="sub" fontSize="11">
                  sc
                </tspan>
              </text>
            </>
          )}
          {mode === "test" && (
            <>
              <path d="M435 70v56m0 48v71" />
              <VoltageSource x={435} y={150} label="" />
              <text x="490" y="157">
                uₜ
              </text>
              <path d="M416 70h-30" />
              <path d="M383 70l8 -4v8z" fill="currentColor" stroke="none" />
              <text x="396" y="47">
                iₜ
              </text>
            </>
          )}
        </g>
      </svg>
      <figcaption>
        {mode === "open"
          ? "移去负载：iL=0，A-B开路，内部R₁、R₂仍有电流。"
          : mode === "short"
            ? "短接A-B：R₂被短路，其电压为0；端口电流由电源与R₁决定。"
            : mode === "resistance"
              ? "独立电压源置零后短路，从A-B看进去，R₁与R₂并联。"
              : "独立源已置零，A-B加测试源；iₜ按流入网络正端定义。"}
      </figcaption>
    </figure>
  );
}
export function SuperpositionDiagram({
  mode = "both",
}: {
  mode?: "both" | "voltage" | "current";
}) {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 570 290"
        role="img"
        aria-label={
          {
            both: "两个独立源共同作用",
            voltage: "电压源单独作用，电流源开路",
            current: "电流源单独作用，电压源短路",
          }[mode]
        }
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M100 126V70h55m90 0h70v35m0 90v50H100v-71M315 70h140v56m0 48v71H315" />
          {mode === "current" ? (
            <>
              <path d="M100 126v48" />
              <text x="60" y="150">
                uS=0
              </text>
            </>
          ) : (
            <VoltageSource x={100} y={150} />
          )}
          <Resistor x={155} y={70} label="R₁" />
          <g transform="translate(315 105) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="352" y="157">
            R₂
          </text>
          {mode === "voltage" ? (
            <>
              <circle cx="455" cy="126" r="3" />
              <circle cx="455" cy="174" r="3" />
              <text x="498" y="153">
                开路
              </text>
            </>
          ) : (
            <CurrentSource x={455} y={150} />
          )}
          <Node x={315} y={70} label="A" />
          <Node x={315} y={245} />
          <Ground x={315} y={245} />
        </g>
      </svg>
      <figcaption>
        {mode === "both"
          ? "完整电路：US=12 V，IS=1 mA，R₁=2 kΩ，R₂=4 kΩ。"
          : mode === "voltage"
            ? "仅US作用：IS置零为开路，R₁与R₂保留。"
            : "仅IS作用：US置零为短路，R₁与R₂保留。"}
      </figcaption>
    </figure>
  );
}
