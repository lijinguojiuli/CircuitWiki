"use client";
import { useState } from "react";
import { sinusoid } from "@/lib/learning-calculations";
import { fmt } from "@/lib/calculations";
import { Field, ErrorMessage } from "./tools/fields";

export function SinusoidalLab() {
  const [peak, setPeak] = useState("10"),
    [frequency, setFrequency] = useState("50"),
    [phase, setPhase] = useState("30"),
    [time, setTime] = useState("0");
  let result: ReturnType<typeof sinusoid> | undefined,
    error = "";
  try {
    if ([peak, frequency, phase, time].some((value) => value.trim() === ""))
      throw new Error("请填写全部参数。");
    result = sinusoid(
      Number(peak),
      Number(frequency),
      Number(phase),
      Number(time) / 1000,
    );
  } catch (e) {
    error = (e as Error).message;
  }
  const path = result
    ? Array.from(
        { length: 101 },
        (_, k) =>
          `${k === 0 ? "M" : "L"}${55 + 4.7 * k} ${145 - (Number(peak) === 0 ? 0 : 85) * Math.cos((2 * Math.PI * k) / 100 + result.phaseRad)}`,
      ).join(" ")
    : "";
  return (
    <section className="learning-lab sinusoidal-lab">
      <h3>从表达式计算瞬时值</h3>
      <p>采用u(t)=Um cos(2πft+φ)。曲线纵轴以Um归一化，横轴展示一个真实周期。</p>
      <div className="fields phasor-fields">
        <Field label="正弦电压峰值" unit="V" value={peak} onChange={setPeak} />
        <Field
          label="频率 f"
          unit="Hz"
          value={frequency}
          onChange={setFrequency}
        />
        <Field label="初相位 φ" unit="°" value={phase} onChange={setPhase} />
        <Field label="求值时刻 t" unit="ms" value={time} onChange={setTime} />
      </div>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <>
            <p className="port-results" aria-live="polite">
              U={fmt(result.rms)} V；ω={fmt(result.omega)} rad/s；T=
              {fmt(result.period * 1000)} ms；u({time} ms)={fmt(result.value)}{" "}
              V。
            </p>
            <figure className="circuit">
              <svg
                viewBox="0 0 580 300"
                role="img"
                aria-label="正弦电压一个周期的波形"
              >
                <g fill="none" stroke="currentColor">
                  <path d="M55 35V250M55 145H535" opacity="0.3" />
                  <path d={path} strokeWidth="2.5" />
                  <text x="25" y="65">
                    +Um
                  </text>
                  <text x="25" y="235">
                    −Um
                  </text>
                  <text x="55" y="278">
                    0
                  </text>
                  <text x="290" y="278">
                    T/2
                  </text>
                  <text x="525" y="278">
                    T
                  </text>
                </g>
              </svg>
              <figcaption>
                正φ使余弦曲线向左移动，即相位超前；频率增大时周期缩短。
              </figcaption>
            </figure>
          </>
        )
      )}
    </section>
  );
}
