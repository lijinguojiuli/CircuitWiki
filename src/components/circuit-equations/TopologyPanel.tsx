import { Formula } from "@/components/formula";
import {
  independentLoops,
  type Topology,
} from "@/lib/circuit-equations/topology";
import { formatComponentValue } from "@/lib/circuit-equations/model";
import type { EditorSelection } from "@/lib/circuit-equations/types";
import styles from "./workspace.module.css";
export function TopologyPanel({
  topology,
  onSelect,
}: {
  topology: Topology;
  onSelect: (s: EditorSelection) => void;
}) {
  const net = topology.netlist,
    cycles = independentLoops(net);
  return (
    <section className={styles.topology} aria-label="自动识别的电路拓扑">
      <h2>电路拓扑</h2>
      <div className={styles.stats}>
        <div>
          <strong>{net.nodes.length}</strong>
          <span>节点</span>
        </div>
        <div>
          <strong>{net.components.length}</strong>
          <span>元件支路</span>
        </div>
        <div>
          <strong>{topology.loopCount}</strong>
          <span>独立回路</span>
        </div>
      </div>
      <p className={styles.muted}>{topology.referenceReason}</p>
      <div className={styles.nodeChips}>
        {net.nodes.map((n) => (
          <span key={n.id}>
            {n.id}
            {n.id === "N0" ? " · 0 V" : ""}
          </span>
        ))}
      </div>
      <ul className={styles.branchList}>
        {net.components.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "component", id: c.id })}
            >
              <span>
                <strong>{c.id}</strong>
                <small>{formatComponentValue(c)}</small>
              </span>
              <span>
                {c.nodes[0]} → {c.nodes[1]}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!!cycles.length && (
        <details>
          <summary>独立回路与 KVL（{cycles.length}）</summary>
          <p className={styles.muted}>
            每条连支与生成树构成一个基本回路；它们不一定是几何网孔。u的方向按元件端子1→2。
          </p>
          {cycles.map((row, i) => (
            <Formula
              key={i}
              latex={
                row
                  .flatMap((v, j) =>
                    v
                      ? [`${v > 0 ? "+" : "-"}u_{${net.components[j].id}}`]
                      : [],
                  )
                  .join("")
                  .replace(/^\+/, "") + "=0"
              }
            />
          ))}
        </details>
      )}
      {!!topology.warnings.length && (
        <details>
          <summary>连接提示（{topology.warnings.length}）</summary>
          <ul>
            {topology.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </details>
      )}
      {!!topology.crossings.length && (
        <p className={styles.muted}>
          有 {topology.crossings.length}{" "}
          处交叉未连接或符号重叠。需要连接时用“连接点”标记。
        </p>
      )}
    </section>
  );
}
