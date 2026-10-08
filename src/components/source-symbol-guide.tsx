import { VoltageSource, CurrentSource } from "./circuit-symbols";
import { Warning } from "./ui";

export function SourceSymbolGuide() {
  const items = [
    { name: "电压源", note: "圆圈内为纵线，外侧标极性", Symbol: VoltageSource },
    {
      name: "电流源",
      note: "圆圈内为横线，外侧标电流箭头",
      Symbol: CurrentSource,
    },
  ];
  return (
    <section className="source-symbol-guide" aria-label="教材中的电源符号">
      <h3>电压源与电流源的教材画法</h3>
      <p>依据《电路》第5版 §1-6 图1-8、图1-10。</p>
      <div className="symbol-grid">
        {items.map(({ name, note, Symbol }) => (
          <figure key={name}>
            <svg viewBox="0 0 170 150" role="img" aria-label={name}>
              <g fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M85 14v40m0 48v32" />
                <Symbol x={85} y={78} />
              </g>
            </svg>
            <figcaption>
              <strong>{name}</strong>
              <span>{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <Warning>
        <p>
          <strong>先认清电源类型，再写元件约束。</strong>
          理想电压源规定端电压，电流由外电路决定；理想电流源规定电流，端电压由外电路决定。
        </p>
        <p>
          外侧箭头表示电流参考方向，＋／－表示电压参考极性。不要仅凭圆圈判断两种电源。
        </p>
      </Warning>
    </section>
  );
}
