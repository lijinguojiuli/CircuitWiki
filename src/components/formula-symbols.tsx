import { InlineFormula } from "./formula";

const symbols = [
  {
    latex: "R_{eq},R_{in}",
    meaning:
      "Req为指定端口的等效电阻，Rin为从该端口看入的输入电阻。求源侧等效时先移去负载、独立源置零，受控关系保留。",
    unit: "Ω",
  },
  {
    latex: "R_k,R_s",
    meaning:
      "Rk是第k只电阻，Rs是串联组合的总等效电阻。k是编号，s表示series（串联）。",
    unit: "Ω",
  },
  {
    latex: "G_k,G_p",
    meaning:
      "Gk=1/Rk是第k支路电导，Gp是并联组合总电导，p表示parallel（并联）。",
    unit: "S",
  },
  {
    latex: "u_k,i_k,R_L",
    meaning:
      "uk、ik分别是第k元件或支路的电压、电流；RL是外部负载电阻，不属于源侧Req。",
    unit: "V、A、Ω",
  },
  {
    latex: "\\tau,t",
    meaning:
      "τ为时间常数，t为换路后时间；t/τ必须无量纲。一个τ不是完全到达终值的时间。",
    unit: "s",
  },
  {
    latex: "\\omega,\\phi",
    meaning:
      "ω是角频率，φ是相位角或已说明的相位差。角度制与弧度制要统一，ω=2πf。",
    unit: "rad/s；rad或°",
  },
  {
    latex: "\\dot U,\\dot I",
    meaning:
      "带点的大写字母表示有效值相量，点号在这里不是时间导数；普通小写u、i表示瞬时量。",
    unit: "V、A",
  },
  {
    latex: "\\sum,\\angle,j",
    meaning:
      "Σ表示逐项代数求和，∠表示极坐标相角，j是虚数单位，j²=−1。下标是含义或编号标记，不是乘法。",
    unit: "按所求量确定",
  },
];

export function FormulaSymbols() {
  return (
    <aside className="formula-symbols">
      <h2>先读懂符号</h2>
      <p>
        <strong>Req</strong>
        是从指定端口看入的网络等效电阻，不是任意一只电阻，也不包含外部负载RL。
      </p>
      <p>
        <strong>Rk</strong>是第k只电阻；k只是编号。每张卡片可展开
        <strong>“符号含义与单位”</strong>，查看当前公式的具体约定。
      </p>
      <details>
        <summary>常用符号索引</summary>
        <div className="symbol-table">
          <table>
            <thead>
              <tr>
                <th>符号</th>
                <th>含义</th>
                <th>单位</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol.latex}>
                  <td>
                    <InlineFormula latex={symbol.latex} />
                  </td>
                  <td>{symbol.meaning}</td>
                  <td>{symbol.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          同一字母在不同上下文可能有不同含义，例如k也可表示耦合因数；请以卡片中的说明为准。
        </p>
      </details>
    </aside>
  );
}
