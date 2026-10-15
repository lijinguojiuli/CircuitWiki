import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CircuitEditor } from "@/components/circuit-equations/CircuitEditor";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/circuit-equations/workspace.module.css";

export const metadata = pageMetadata(
  "电路方程自动生成器",
  "绘制电阻与独立源电路，自动识别节点和网孔，生成KCL、KVL与矩阵方程，展示消元、支路结果和功率校验。",
  "/tools/equations",
  true,
);
export default function EquationGeneratorPage() {
  return (
    <main id="main" className={styles.page}>
      <Link className={styles.backLink} href="/tools">
        <ArrowLeft size={14} />
        电路工具
      </Link>
      <div className={styles.hero}>
        <div>
          <p className={styles.kicker}>CIRCUIT EQUATION GENERATOR</p>
          <h1>电路方程自动生成器</h1>
          <p className={styles.lead}>
            放置元件、连接端子，让电路自动生成方程。支持直流 R / V / I
            电路，用节点法与网孔法逐步理解 KCL、KVL 和求解过程。
          </p>
        </div>
        <Link href="/learn/nodal-analysis">
          复习节点电压法
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <CircuitEditor />
    </main>
  );
}
