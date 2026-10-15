import { useState } from "react";
import { Formula } from "@/components/formula";
import {
  numberTex,
  type CircuitAnalysis,
} from "@/lib/circuit-equations/solver";
import type {
  CircuitDocument,
  EditorSelection,
} from "@/lib/circuit-equations/types";
import type { Topology } from "@/lib/circuit-equations/topology";
import { CircuitDrawing } from "./CircuitDrawing";
import styles from "./workspace.module.css";
export function EquationPanel({
  analysis: a,
  document: doc,
  topology,
  mode,
  onSelect,
}: {
  analysis: CircuitAnalysis;
  document: CircuitDocument;
  topology: Topology;
  mode: "quick" | "learning";
  onSelect: (s: EditorSelection) => void;
}) {
  const [step, setStep] = useState(0);
  if (a.status === "empty")
    return (
      <section id="equation-output" className={styles.equations}>
        <h2>从一个电路开始</h2>
        <p>
          把元件放上画板并连接端子。也可以载入示例，然后修改参数观察方程如何变化。
        </p>
      </section>
    );
  return (
    <section
      id="equation-output"
      className={styles.equations}
      aria-label="自动生成的方程"
    >
      <div className={styles.panelHeading}>
        <h2>{a.method === "nodal" ? "节点电压法" : "网孔电流法"}</h2>
        <span>{a.status === "solved" ? "已自动求解" : "请检查电路"}</span>
      </div>
      <p className={styles.methodReason}>{a.reason}</p>
      {a.error && (
        <div className={styles.diagnostic} role="alert">
          <strong>无法得到唯一、可靠的结果</strong>
          <p>{a.error}</p>
        </div>
      )}
      {mode === "learning" && a.status === "solved" ? (
        <>
          <div
            className={styles.stepChoices}
            role="group"
            aria-label="推导步骤"
          >
            {a.steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <span>{i + 1}</span>
                {s.title}
              </button>
            ))}
          </div>
          <div className={styles.teachingStep} data-teaching-step={step + 1}>
            <p className={styles.stepCount}>
              步骤 {step + 1} / {a.steps.length}
            </p>
            <h3>{a.steps[step].title}</h3>
            <p>{a.steps[step].explanation}</p>
            {[0, 1, 2, 5].includes(step) && (
              <figure className={styles.stepDiagram}>
                <div className={styles.stepDiagramScroll}>
                  <CircuitDrawing
                    snapshot
                    document={doc}
                    topology={topology}
                    referenceOnly={step === 0}
                    showDirections={step !== 0}
                    meshes={a.method === "mesh" ? a.meshes : []}
                  />
                </div>
                <figcaption>
                  {step === 0
                    ? "确定同一节点与参考电位"
                    : a.method === "mesh"
                      ? "按顺时针网孔与支路参考方向列式"
                      : "所有元件电流均按端子1→2约定；电压源极性单独标出"}
                </figcaption>
              </figure>
            )}
            {a.steps[step].equations.map((eq, i) => (
              <div key={i}>
                <span className={styles.equationLabel}>{eq.label}</span>
                <Formula latex={eq.latex} />
              </div>
            ))}
          </div>
          <div className={styles.stepNavigation}>
            <button disabled={!step} onClick={() => setStep((s) => s - 1)}>
              上一步
            </button>
            <button
              disabled={step === a.steps.length - 1}
              onClick={() => setStep((s) => s + 1)}
            >
              下一步
            </button>
          </div>
        </>
      ) : (
        <div>
          {a.equations.map((eq, i) => (
            <div key={i}>
              <span className={styles.equationLabel}>{eq.label}</span>
              <Formula latex={eq.latex} />
            </div>
          ))}
        </div>
      )}
      {a.matrix && (
        <details className={styles.matrix} open={mode === "quick"}>
          <summary>矩阵方程 AX = B</summary>
          <Formula latex={a.matrixLatex!} />
          <p>列未知量及单位：</p>
          <Formula
            latex={a.matrix.unknowns
              .map((v) => `${v.symbol}\\;[\\mathrm{${v.unit}}]`)
              .join(",\\quad ")}
          />
          <p className={styles.muted}>
            各行单位依次为 {a.matrix.rowUnits.join("、")}
            。KCL行是A，KVL与电压约束行是V；所有输入均换算为SI单位。
            矩阵显示保留7位有效数字，内部计算使用原始数值。
          </p>
        </details>
      )}
      {!!a.elimination.length && (
        <details className={styles.elimination}>
          <summary>查看实际数值消元过程（{a.elimination.length}步）</summary>
          <p>
            先按行、列缩放：A′ = Dᵣ⁻¹ A D꜀⁻¹，b′ = Dᵣ⁻¹ B，Y =
            D꜀X。以下增广矩阵使用Y，最终结果已还原为X。
          </p>
          <p className={styles.muted}>
            行缩放：{a.rowScale?.map((v) => v.toPrecision(4)).join("，")}
            ；列缩放：{a.columnScale?.map((v) => v.toPrecision(4)).join("，")}。
          </p>
          {a.elimination.map((s, i) => (
            <div key={i}>
              <p>{s.description}</p>
              <Formula
                latex={`\\left[\\begin{array}{${"r".repeat(s.matrix.length)}|r}${s.matrix.map((row, j) => [...row, s.rhs[j]].map(numberTex).join("&")).join("\\\\")}\\end{array}\\right]`}
              />
            </div>
          ))}
        </details>
      )}
      {a.status === "solved" && (
        <div className={styles.results}>
          <h3>电路结果</h3>
          <div className={styles.nodeChips}>
            {Object.entries(a.voltages)
              .sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
              .map(([n, v]) => (
                <span key={n}>
                  {n} = {Number(v.toPrecision(6))} V
                </span>
              ))}
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th>元件</th>
                  <th>电压 / V</th>
                  <th>电流 / A</th>
                  <th>吸收功率 / W</th>
                </tr>
              </thead>
              <tbody>
                {a.branches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <button
                        onClick={() =>
                          onSelect({ kind: "component", id: b.id })
                        }
                      >
                        {b.id}
                      </button>
                    </td>
                    <td>{Number(b.voltage.toPrecision(6))}</td>
                    <td>{Number(b.current.toPrecision(6))}</td>
                    <td>{Number(b.power.toPrecision(6))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.muted}>
            电压取端子1对端子2，电流取端子1→2。负功率表示发出；负电流表示实际反向。
          </p>
          <p className={styles.check}>
            回代相对残差 {a.residual!.toExponential(2)} · 总功率代数和{" "}
            {a.powerBalance!.toExponential(2)} W
          </p>
        </div>
      )}
    </section>
  );
}
