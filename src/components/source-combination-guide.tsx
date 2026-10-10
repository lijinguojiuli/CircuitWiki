import {
  CurrentSource,
  VoltageSource,
  Resistor,
  Node,
} from "./circuit-symbols";
const combinations = [
  {
    id: "parallel-sources",
    title: "电压源 ∥ 电流源 → 电压源",
    parallel: true,
    resistor: false,
    voltage: true,
    note: "理想电压源固定端口电压。电流源改变内部电流分配，不能据此说电流源电流为零。",
  },
  {
    id: "series-sources",
    title: "电压源 ＋ 电流源串联 → 电流源",
    parallel: false,
    resistor: false,
    voltage: false,
    note: "理想电流源固定串联电流。电压源改变内部电压分配，端口电压仍由外电路决定。",
  },
  {
    id: "voltage-parallel-r",
    title: "电压源 ∥ 电阻 → 电压源",
    parallel: true,
    resistor: true,
    voltage: true,
    note: "整个二端组合对外仍有u=US。并联电阻仍流过US/R并消耗US²/R，内部功率不能删去。",
  },
  {
    id: "current-series-r",
    title: "电流源 ＋ 电阻串联 → 电流源",
    parallel: false,
    resistor: true,
    voltage: false,
    note: "整个二端组合对外仍有i=IS。串联电阻仍有IS R压降和IS²R损耗。",
  },
] as const;

export function SourceCombinationGuide() {
  return (
    <div className="source-combinations">
      {combinations.map((item) => (
        <figure
          className="circuit source-combination"
          key={item.id}
          data-equivalent={item.voltage ? "voltage-source" : "current-source"}
        >
          <h3>{item.title}</h3>
          <svg viewBox="0 0 650 340" role="img" aria-label={item.title}>
            <title>{item.title}</title>
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {item.parallel ? (
                <>
                  <path d="M70 146V40h190M70 194v106h190M185 40v85m0 90v85" />
                  <VoltageSource x={70} y={170} />
                  {item.resistor ? (
                    <>
                      <g transform="translate(185 125) rotate(90)">
                        <Resistor x={0} y={0} label="" />
                      </g>
                      <text x="225" y="175">
                        R
                      </text>
                    </>
                  ) : (
                    <>
                      <path d="M185 125v21m0 48v21" />
                      <CurrentSource x={185} y={170} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <path d="M125 40h135M125 300h135M125 244v56" />
                  {item.resistor ? (
                    <>
                      <path d="M125 40v15m0 90v51" />
                      <g transform="translate(125 55) rotate(90)">
                        <Resistor x={0} y={0} label="" />
                      </g>
                      <text x="165" y="105">
                        R
                      </text>
                    </>
                  ) : (
                    <>
                      <path d="M125 40v36m0 48v72" />
                      <VoltageSource x={125} y={100} />
                    </>
                  )}
                  <CurrentSource x={125} y={220} />
                </>
              )}
              <Node x={260} y={40} label="A" />
              <Node x={260} y={300} label="B" />
              <text x="345" y="175">
                ≡
              </text>
              <path d="M465 146V40h115M465 194v106h115" />
              {item.voltage ? (
                <VoltageSource x={465} y={170} />
              ) : (
                <CurrentSource x={465} y={170} />
              )}
              <Node x={580} y={40} label="A" />
              <Node x={580} y={300} label="B" />
            </g>
          </svg>
          <figcaption>{item.note}</figcaption>
        </figure>
      ))}
    </div>
  );
}
