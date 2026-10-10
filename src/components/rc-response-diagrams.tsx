import {
  Capacitor,
  Ground,
  Node,
  Resistor,
  VoltageSource,
} from "./circuit-symbols";
import { Formula } from "./formula";
const responses = [
  {
    title: "零输入响应",
    initial: 2,
    source: 0,
    note: "只有初始储能：电源置零，电容放电。",
    latex: "u_C(t)=U_0e^{-t/\\tau}",
    caption: "US = 0，U₀ = 2 V",
  },
  {
    title: "零状态响应",
    initial: 0,
    source: 5,
    note: "只有外部输入：电容初始未储能。",
    latex: "u_C(t)=U_S(1-e^{-t/\\tau})",
    caption: "US = 5 V，U₀ = 0 V",
  },
  {
    title: "全响应",
    initial: 2,
    source: 5,
    note: "初始储能与外部输入同时存在。",
    latex: "u_C(t)=U_S+(U_0-U_S)e^{-t/\\tau}",
    caption: "US = 5 V，U₀ = 2 V",
  },
];
function Wave({ initial, source }: { initial: number; source: number }) {
  const path = Array.from({ length: 81 }, (_, i) => {
    const t = (5 * i) / 80,
      voltage = source + (initial - source) * Math.exp(-t);
    return `${i === 0 ? "M" : "L"}${32 + (218 * i) / 80} ${112 - 16 * voltage}`;
  }).join(" ");
  return (
    <svg
      viewBox="0 0 280 145"
      role="img"
      aria-label={`电容电压从${initial} V趋向${source} V，横轴为时间`}
    >
      <g fill="none" stroke="currentColor">
        <path d="M32 18v94h220" opacity=".4" />
        <path d={path} strokeWidth="2.5" />
        <circle cx="32" cy={112 - 16 * initial} r="3" fill="currentColor" />
      </g>
      <g fill="currentColor" className="response-plot-label">
        <text x="2" y="18">
          uC / V
        </text>
        <text x="12" y="115">
          0
        </text>
        <text x="12" y="35">
          5
        </text>
        <text x="30" y="132">
          0
        </text>
        <text x="229" y="132">
          5τ
        </text>
        <text x="76" y="143">
          τ = Req C，t ≥ 0
        </text>
      </g>
    </svg>
  );
}
export function RCResponseDiagrams() {
  return (
    <section className="response-types" aria-label="三种一阶响应的电路与波形">
      <h3>三张图记住三种响应</h3>
      <p>
        统一取 R=1 kΩ、C=100 μF，τ=0.1 s。下图画出 t&gt;0
        的换路后电路，曲线使用同一纵轴范围。
      </p>
      <div className="response-grid">
        {responses.map((r) => (
          <figure className="response-card" key={r.title}>
            <h4>{r.title}</h4>
            <svg
              className="circuit response-circuit"
              viewBox="0 0 410 265"
              role="img"
              aria-label={r.title + "对应RC电路"}
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M80 106V55h55m90 0h70v40m0 90v25H80v-56" />
                {r.source === 0 ? (
                  <path d="M80 106v48" />
                ) : (
                  <VoltageSource x={80} y={130} />
                )}
                <Resistor x={135} y={55} label="R" />
                <g transform="translate(295 95) rotate(90)">
                  <Capacitor x={0} y={0} label="" />
                </g>
                <text x="327" y="142">
                  C
                </text>
                <Node x={295} y={210} />
                <Ground x={295} y={210} />
                <text x="187" y="256">
                  {r.caption}
                </text>
              </g>
            </svg>
            <Wave initial={r.initial} source={r.source} />
            <p>{r.note}</p>
            <Formula latex={r.latex} />
          </figure>
        ))}
      </div>
      <p>
        <strong>记忆顺序：</strong>
        先看有没有初始储能，再看有没有外部输入。线性电路中，全响应 = 零输入响应
        + 零状态响应；三种响应必须使用相同的换路后 R、C 和参考方向。
      </p>
    </section>
  );
}
