import { ControlledSource } from "./controlled-source-symbol";
import { Resistor, Node, Ground, VoltageSource } from "./circuit-symbols";
export function ControlledSourceGallery() {
  const kinds = [
    {
      title: "VCVS：电压控制电压源",
      kind: "voltage",
      label: "μuₓ",
      note: "u = μuₓ，μ 无量纲",
      down: false,
    },
    {
      title: "VCCS：电压控制电流源",
      kind: "current",
      label: "guₓ",
      note: "i = guₓ，g 单位 S",
      down: false,
    },
    {
      title: "CCVS：电流控制电压源",
      kind: "voltage",
      label: "riₓ",
      note: "u = riₓ，r 单位 Ω",
      down: false,
    },
    {
      title: "CCCS：电流控制电流源",
      kind: "current",
      label: "βiₓ",
      note: "i = βiₓ，β 无量纲",
      down: true,
    },
  ] as const;
  return (
    <div className="controlled-source-grid">
      {kinds.map((item) => (
        <figure className="circuit" key={item.title}>
          <svg viewBox="0 0 230 170" role="img" aria-label={item.title}>
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M130 15v50m0 50v40" />
              <ControlledSource
                x={130}
                y={90}
                kind={item.kind}
                label={item.label}
                down={item.down}
              />
            </g>
          </svg>
          <figcaption>
            <strong>{item.title}</strong>
            <br />
            {item.note}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
export function ControlledTestDiagram() {
  return (
    <figure className="circuit">
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="1千欧电阻与受控电流源并联，从A-B端口加测试电压"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M155 65h300v60m0 50v70H155v-60m0 -90v-30M330 65v60m0 50v70" />
          <g transform="translate(155 95) rotate(90)">
            <Resistor x={0} y={0} label="" />
          </g>
          <text x="195" y="150">
            R = 1 kΩ
          </text>
          <ControlledSource x={330} y={150} kind="current" label="guₓ" down />
          <VoltageSource x={455} y={150} label="uₜ" />
          <Node x={455} y={65} label="A" />
          <Node x={455} y={245} />
          <text x="425" y="275">
            B
          </text>
          <Ground x={455} y={245} />
          <path d="M420 65h-30" />
          <path d="M388 65l8 -4v8z" fill="currentColor" stroke="none" />
          <text x="405" y="45">
            iₜ 流入网络
          </text>
        </g>
      </svg>
      <figcaption>
        uₓ 定义为 A 对 B 的电压，因此 uₓ=uₜ。受控源方向 A→B，保留菱形和 i=guₓ
        约束。
      </figcaption>
    </figure>
  );
}
