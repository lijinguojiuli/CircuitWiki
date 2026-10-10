"use client";
import { useId, useState } from "react";
import { seriesPhasors, parallelPhasors } from "@/lib/learning-calculations";
import { fmt } from "@/lib/calculations";

const cases = [
  { label: "感性：RL", r: 30, xl: 40, xc: 0 },
  { label: "容性：RC", r: 30, xl: 0, xc: 40 },
  { label: "谐振：RLC", r: 30, xl: 40, xc: 40 },
];
function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  labelX,
  labelY,
  strong = false,
  markerId,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  labelX: number;
  labelY: number;
  strong?: boolean;
  markerId: string;
}) {
  return (
    <g strokeWidth={strong ? 3 : 1.8}>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} markerEnd={`url(#${markerId})`} />
      <text x={labelX} y={labelY}>
        {label}
      </text>
    </g>
  );
}

export function PhasorConstruction() {
  const [selected, setSelected] = useState(0),
    [step, setStep] = useState(4),
    [mode, setMode] = useState<"series" | "parallel">("series");
  const id = useId(),
    model = cases[selected],
    series = seriesPhasors(model.r, model.xl, model.xc),
    parallel = parallelPhasors(
      100,
      selected === 1 ? 0 : 100,
      selected === 0 ? 0 : 100,
    ),
    isParallel = mode === "parallel",
    result = isParallel
      ? {
          ur: parallel.ir,
          ul: parallel.il,
          uc: parallel.ic,
          reactive: parallel.reactive,
          magnitude: parallel.magnitude,
          angle: parallel.angle,
        }
      : series;
  const ox = 115,
    oy = 225,
    scale = isParallel ? 90 : 3,
    rx = ox + result.ur * scale,
    ly = oy - (isParallel ? -1 : 1) * result.ul * scale,
    uy = oy - result.reactive * scale;
  return (
    <section className="learning-lab phasor-construction">
      <h3>按步骤画串联电压与并联电流</h3>
      <div className="segmented">
        <button aria-pressed={!isParallel} onClick={() => setMode("series")}>
          串联：画电压
        </button>
        <button aria-pressed={isParallel} onClick={() => setMode("parallel")}>
          并联：画电流
        </button>
      </div>
      <p>
        {isParallel
          ? "U=100 V，R=100 Ω，接入的L/C支路电抗大小均为100 Ω。"
          : "I=1 A，R=30 Ω，接入的L/C电抗大小均为40 Ω。"}
      </p>
      <div className="segmented">
        {cases.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="drawing-step">
        画图步骤：{step}/4
        <input
          aria-label="相量画图步骤"
          type="range"
          min="1"
          max="4"
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
        />
      </label>
      <figure className="circuit">
        <svg
          viewBox="0 0 520 440"
          role="img"
          aria-label={`${isParallel ? "并联" : "串联"}${model.label}相量图，第${step}步`}
        >
          <title>
            {isParallel ? "取电压为参考，画电流和" : "取电流为参考，画电压和"}
          </title>
          <defs>
            <marker
              id={id}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10z" fill="currentColor" />
            </marker>
          </defs>
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <path d={`M55 ${oy}H430M${ox} 55V385`} opacity="0.2" />
            <text x="440" y={oy + 5}>
              实轴
            </text>
            <text x={ox} y="40">
              +j
            </text>
            <Arrow
              markerId={id}
              x1={380}
              y1={60}
              x2={445}
              y2={60}
              label={isParallel ? "U̇（参考方向）" : "İ（参考方向）"}
              labelX={412}
              labelY={83}
            />
            {step >= 2 && (
              <Arrow
                markerId={id}
                x1={ox}
                y1={oy}
                x2={rx}
                y2={oy}
                label={isParallel ? "İR" : "U̇R"}
                labelX={(ox + rx) / 2}
                labelY={oy - 12}
              />
            )}
            {step >= 3 && result.ul > 0 && (
              <Arrow
                markerId={id}
                x1={rx}
                y1={oy}
                x2={rx}
                y2={ly}
                label={isParallel ? "İL" : "U̇L"}
                labelX={rx + 25}
                labelY={(oy + ly) / 2}
              />
            )}
            {step >= 3 && result.uc > 0 && (
              <Arrow
                markerId={id}
                x1={rx}
                y1={ly}
                x2={rx}
                y2={uy}
                label={isParallel ? "İC" : "U̇C"}
                labelX={rx + (result.ul ? 70 : 25)}
                labelY={(ly + uy) / 2}
              />
            )}
            {step >= 4 && (
              <Arrow
                markerId={id}
                x1={ox}
                y1={oy}
                x2={rx}
                y2={uy}
                label={isParallel ? "İ（总电流）" : "U̇（总电压）"}
                labelX={rx + 65}
                labelY={uy + (result.reactive < 0 ? 20 : -12)}
                strong
              />
            )}
            <text x="260" y="415">
              {isParallel
                ? "电流比例一致；电压箭头仅作相位参考"
                : "电压比例一致；电流箭头仅作相位参考"}
            </text>
          </g>
        </svg>
        <figcaption>
          {
            (isParallel
              ? [
                  "先把公共电压画在水平正方向。",
                  "电阻支路电流与电压同相，沿正实轴画。",
                  "从前一箭头末端接电感向下、电容向上的电流箭头。",
                  "从最初起点连到最终终点，就是总电流；按KCL求和。",
                ]
              : [
                  "先把电流参考相量画在水平正方向。",
                  "电阻电压与电流同相，沿正实轴画。",
                  "从电阻电压末端接感性上箭头、容性下箭头；谐振时二者抵消。",
                  "从最初起点连到最终终点，就是总电压；平移保持长度和方向。",
                ])[step - 1]
          }
        </figcaption>
      </figure>
      <p className="port-results" aria-live="polite">
        {isParallel
          ? `U=100 V；IR=${fmt(result.ur)} A，IL=${fmt(result.ul)} A，IC=${fmt(result.uc)} A。总电流：${fmt(result.magnitude)}∠${fmt(result.angle)}° A。`
          : `I=1 A；UR=${fmt(result.ur)} V，UL=${fmt(result.ul)} V，UC=${fmt(result.uc)} V。总电压：${fmt(result.magnitude)}∠${fmt(result.angle)}° V。`}
      </p>
    </section>
  );
}
