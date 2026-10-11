import { Capacitor, Inductor, Node } from "./circuit-symbols";
import { Formula } from "./formula";

type StorageCase = {
  id: string;
  family: "C" | "L";
  parallel: boolean;
  title: string;
  latex: string;
  reason: string;
  initial: string;
  example: string;
};
const cases: StorageCase[] = [
  {
    id: "capacitor-parallel",
    family: "C",
    parallel: true,
    title: "电容并联：等效电容相加",
    latex: "C_{eq}=C_1+C_2",
    reason:
      "两电容接在同一对端子上，电压相同，总电流为两支路电流之和。由 i=C du/dt，等效电容就是 C₁+C₂。",
    initial:
      "并联前的初始电压必须与共同端电压相容；不同初始电压的理想电容不能直接无阻连接。",
    example: "2 μF 与 3 μF 并联，等效为 5 μF；正电容并联后比任一单只电容大。",
  },
  {
    id: "capacitor-series",
    family: "C",
    parallel: false,
    title: "电容串联：等效电容按倒数相加",
    latex:
      "\\frac1{C_{eq}}=\\frac1{C_1}+\\frac1{C_2},\\quad C_{eq}=\\frac{C_1C_2}{C_1+C_2}",
    reason:
      "中间结点没有其他支路，两电容电流相同，总电压为两电容电压之和。分别用电流积分求电压，1/C 的系数相加。",
    initial:
      "按从 a 到 b 的同一方向定义电压，等效初始电压为 u₁(0)+u₂(0)，不能合并参数后把初值丢掉。",
    example: "2 μF 与 3 μF 串联，等效为 1.2 μF；正电容串联后比最小的那只还小。",
  },
  {
    id: "inductor-series",
    family: "L",
    parallel: false,
    title: "电感串联：等效电感相加",
    latex: "L_{eq}=L_1+L_2",
    reason:
      "无互感时，两电感流过同一电流，总电压为两电感电压之和。由 u=L di/dt，等效电感就是 L₁+L₂。",
    initial: "串联电感的电流必须相容；等效元件保留这条支路的初始电流。",
    example: "2 mH 与 3 mH 无互感串联，等效为 5 mH。存在互感时不能直接用本式。",
  },
  {
    id: "inductor-parallel",
    family: "L",
    parallel: true,
    title: "电感并联：等效电感按倒数相加",
    latex:
      "\\frac1{L_{eq}}=\\frac1{L_1}+\\frac1{L_2},\\quad L_{eq}=\\frac{L_1L_2}{L_1+L_2}",
    reason:
      "无互感时，两支路电压相同，总电流为两电感电流之和。分别用电压积分求电流，1/L 的系数相加。",
    initial:
      "取两支路电流都从 a 流向 b，等效初始电流为 i₁(0)+i₂(0)，代数符号也要保留。",
    example: "2 mH 与 3 mH 无互感并联，等效为 1.2 mH。",
  },
];

export function StorageEquivalenceDiagrams({ family }: { family?: "C" | "L" }) {
  return (
    <div
      className="storage-equivalences"
      id={family ? `storage-diagrams-${family}` : "storage-diagrams"}
    >
      {cases
        .filter((item) => !family || item.family === family)
        .map((item) => {
          const Part = item.family === "C" ? Capacitor : Inductor;
          return (
            <section
              className="storage-equivalence"
              key={item.id}
              id={item.id}
              data-storage-kind={item.id}
            >
              <h3>{item.title}</h3>
              <figure className="circuit storage-equivalence-figure">
                <div
                  className="storage-svg-scroll"
                  tabIndex={0}
                  aria-label={`${item.title}的原电路与等效图，窄屏可横向查看`}
                >
                  <svg
                    viewBox="0 0 680 230"
                    role="img"
                    aria-label={`${item.title}，左侧原电路，右侧单一等效元件`}
                  >
                    <title>{`${item.title}：a、b端口保持不变`}</title>
                    <g
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    >
                      {item.parallel ? (
                        <>
                          <path d="M45 115H80V65H130M220 65H280V165H220M130 165H80V115M280 115H315" />
                          <Part x={130} y={65} label={`${item.family}_1`} />
                          <Part x={130} y={165} label={`${item.family}_2`} />
                          <Node x={80} y={115} />
                          <Node x={280} y={115} />
                        </>
                      ) : (
                        <>
                          <path d="M45 115H75M165 115H195M285 115H315" />
                          <Part x={75} y={115} label={`${item.family}_1`} />
                          <Part x={195} y={115} label={`${item.family}_2`} />
                        </>
                      )}
                      <Node x={45} y={115} label="a" />
                      <Node x={315} y={115} label="b" />
                      <path d="M350 115H404m-10 -6l10 6l-10 6" />
                      <path d="M450 115H490M580 115H635" />
                      <Part x={490} y={115} label={`${item.family}_eq`} />
                      <Node x={450} y={115} label="a" />
                      <Node x={635} y={115} label="b" />
                    </g>
                    <text x="175" y="205">
                      原电路
                    </text>
                    <text x="540" y="205">
                      等效电路
                    </text>
                  </svg>
                </div>
                <figcaption>
                  保持 a、b
                  两个端子及参考方向；电感图均按无互感处理。窄屏可左右滑动查看。
                </figcaption>
              </figure>
              <Formula latex={item.latex} />
              <p>
                <strong>为什么这样合并：</strong>
                {item.reason}
              </p>
              <p>
                <strong>初始值怎么保留：</strong>
                {item.initial}
              </p>
              <p className="storage-example">
                <strong>代入示例：</strong>
                {item.example}
              </p>
            </section>
          );
        })}
    </div>
  );
}
