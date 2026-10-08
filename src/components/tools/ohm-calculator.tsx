"use client";
import { useState } from "react";
import { Formula } from "../formula";
import { Field, ErrorMessage } from "./fields";
import { ohm, fmt } from "@/lib/calculations";
export function OhmCalculator() {
  const [u, setU] = useState("12"),
    [i, setI] = useState(""),
    [r, setR] = useState("1000");
  let result: ReturnType<typeof ohm> | undefined,
    error = "";
  try {
    result = ohm({
      ...(u !== "" ? { u: Number(u) } : {}),
      ...(i !== "" ? { i: Number(i) } : {}),
      ...(r !== "" ? { r: Number(r) } : {}),
    });
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <section className="calculator" id="ohm">
      <div className="eyebrow">欧姆定律</div>
      <h2>欧姆定律 / 功率计算器</h2>
      <p>填写任意两个已知量，清空待求量。采用无源电阻的关联参考方向。</p>
      <div className="fields">
        <Field label="电压 U" unit="V" value={u} onChange={setU} />
        <Field label="电流 I" unit="A" value={i} onChange={setI} />
        <Field label="电阻 R" unit="Ω" value={r} onChange={setR} />
      </div>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <div className="results" aria-live="polite">
            {[
              ["U", result.u, "V"],
              ["I", result.i, "A"],
              ["R", result.r, "Ω"],
              ["P", result.p, "W"],
            ].map(([label, value, unit]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>
                  {fmt(Number(value))} <small>{unit}</small>
                </strong>
              </div>
            ))}
          </div>
        )
      )}
      <Formula
        description="第5版式（1-5）；工具中的 U、I、P 表示这里的直流恒定值。"
        latex={"p=ui=Ri^2=\\frac{u^2}{R}"}
      />
    </section>
  );
}
