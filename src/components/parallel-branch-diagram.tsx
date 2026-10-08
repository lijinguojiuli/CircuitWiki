import { Resistor, VoltageSource } from "./circuit-symbols";
import {
  branchNames,
  legPositions,
  type BranchView,
} from "@/lib/topology-example";
export function ParallelBranchDiagram({
  view,
  first,
  second,
}: {
  view: BranchView;
  first: number;
  second: number;
}) {
  const left = legPositions[first],
    right = legPositions[second];
  return (
    <figure className="circuit topology-diagram">
      <svg
        viewBox="0 0 640 365"
        role="img"
        aria-label={`多回路电路：${view === "elements" ? "5条元件支路、3个建图结点" : "4条组合支路、2个建图结点"}，高亮第${first + 1}与第${second + 1}列构成的回路`}
      >
        <title>四条并联分支与三个网孔</title>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M90 72H540M90 310H540" opacity=".35" />
          <path
            d={`M${left} 72H${right}M${left} 310H${right}`}
            strokeWidth="3.5"
          />
          {legPositions.map((x, leg) => {
            const active = leg === first || leg === second;
            return (
              <g
                key={x}
                opacity={active ? 1 : 0.32}
                strokeWidth={active ? 2.8 : 1.6}
              >
                {leg === 0 ? (
                  <>
                    <path d="M90 72v28m0 90v21m0 48v51" />
                    <g transform="translate(90 100) rotate(90)">
                      <Resistor x={0} y={0} label="" />
                    </g>
                    <text x="122" y="150">
                      R₁
                    </text>
                    <VoltageSource x={90} y={235} />
                    {view === "elements" && (
                      <>
                        <circle cx="90" cy="200" r="4.5" fill="currentColor" />
                        <text x="64" y="204">
                          C
                        </text>
                        <text x="53" y="135">
                          e1
                        </text>
                        <text x="53" y="279">
                          e2
                        </text>
                      </>
                    )}
                    {view === "series" && (
                      <text x="90" y="45">
                        b1
                      </text>
                    )}
                  </>
                ) : (
                  <>
                    <path d={`M${x} 72v68m0 90v80`} />
                    <g transform={`translate(${x} 140) rotate(90)`}>
                      <Resistor x={0} y={0} label="" />
                    </g>
                    <text x={x + 32} y="191">
                      R{leg + 1}
                    </text>
                    <text x={x} y="45">
                      {branchNames(leg, view)[0]}
                    </text>
                  </>
                )}
                <circle cx={x} cy="72" r="4.5" fill="currentColor" />
                <circle cx={x} cy="310" r="4.5" fill="currentColor" />
              </g>
            );
          })}
          <path
            d={`M${left - 18} 102v24M${right - 18} 126v-24`}
            strokeWidth="2"
          />
          <path
            d={`M${left - 18} 130l-4 -8h8zM${right - 18} 98l-4 8h8z`}
            fill="currentColor"
            stroke="none"
          />
          <text x="326" y="61">
            结点 A：整条上导线
          </text>
          <text x="326" y="342">
            结点 B：整条下导线
          </text>
          <text x={(left + right) / 2} y="289">
            选定回路
          </text>
        </g>
      </svg>
      <figcaption>
        粗线表示所选闭合路径：从 A 沿左侧选中分支向下，经过
        B，再沿右侧选中分支回到 A。其余元件仍连接在电路中。
      </figcaption>
    </figure>
  );
}
