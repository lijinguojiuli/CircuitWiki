"use client";
import { useState } from "react";
import { ThreePhaseDiagram } from "./three-phase-diagram";
import { Field, ErrorMessage } from "./tools/fields";
import { threePhaseLoad } from "@/lib/learning-calculations";
import { fmt } from "@/lib/calculations";

export function ThreePhaseLab() {
  const [connection, setConnection] = useState<"star" | "delta">("star");
  const [u, setU] = useState("380"),
    [z, setZ] = useState("30"),
    [angle, setAngle] = useState("30");
  let result: ReturnType<typeof threePhaseLoad> | undefined,
    error = "";
  try {
    if ([u, z, angle].some((value) => value.trim() === ""))
      throw new Error("请填写全部参数。");
    result = threePhaseLoad(Number(u), Number(z), Number(angle), connection);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <section className="learning-lab three-phase-lab">
      <h3>同一线电压、同一相阻抗，比较Y与Δ</h3>
      <p>
        对称正序电源与对称负载，忽略线路阻抗。图中Zₗ按0处理；这里比较接法变化，不是做保持端口等效的阻抗变换。
      </p>
      <div className="segmented">
        <button
          aria-pressed={connection === "star"}
          onClick={() => setConnection("star")}
        >
          Y 星形
        </button>
        <button
          aria-pressed={connection === "delta"}
          onClick={() => setConnection("delta")}
        >
          Δ 三角形
        </button>
      </div>
      <div className="fields">
        <Field label="负载端线电压" unit="V" value={u} onChange={setU} />
        <Field label="每相阻抗模" unit="Ω" value={z} onChange={setZ} />
        <Field label="阻抗角" unit="°" value={angle} onChange={setAngle} />
      </div>
      <ThreePhaseDiagram connection={connection} />
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <div className="port-results" aria-live="polite">
            <p>
              相电压：{fmt(result.phaseVoltage)} V；相电流：
              {fmt(result.phaseCurrent)} A；线电流：{fmt(result.lineCurrent)}{" "}
              A。
            </p>
            <p>
              P={fmt(result.active)} W；Q={fmt(result.reactive)} var；S=
              {fmt(result.apparent)} VA。
            </p>
            <p>
              {connection === "star"
                ? "Y：相电压=线电压/√3，线电流=相电流。"
                : "Δ：相电压=线电压，线电流=√3×相电流（对称条件）。"}
            </p>
          </div>
        )
      )}
    </section>
  );
}
