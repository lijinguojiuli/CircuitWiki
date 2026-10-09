"use client";
import { useState } from "react";
import { Formula } from "../formula";
import { Field, ErrorMessage } from "./fields";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { rcResponse, fmt } from "@/lib/calculations";
export function RCCalculator({ compact = false }: { compact?: boolean }) {
  const [r, setR] = useState("1000"),
    [c, setC] = useState("100"),
    [vin, setU_S] = useState("5");
  let result: ReturnType<typeof rcResponse> | undefined,
    error = "";
  try {
    if ([r, c, vin].includes("")) throw new Error("请填写所有参数。");
    result = rcResponse(Number(r), Number(c), Number(vin));
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <section className={`calculator ${compact ? "compact" : ""}`} id="rc">
      <div className="eyebrow">RC 响应计算</div>
      <h2>看见电容充电的过程</h2>
      <p>零初始电压，t=0接入恒定直流电源。调整参数，观察 0–5τ 内的响应。</p>
      <div className="fields">
        <Field label="电阻 R" unit="Ω" value={r} onChange={setR} />
        <Field label="电容 C" unit="μF" value={c} onChange={setC} />
        <Field label="输入电压 U_S" unit="V" value={vin} onChange={setU_S} />
      </div>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <>
            <div className="rc-stats" aria-live="polite">
              <span>
                时间常数 <strong>τ = {fmt(result.tau)} s</strong>
              </span>
              <span>
                在 t = τ 时达到终值的 <strong>63.2%</strong>
              </span>
            </div>
            <div
              className="chart"
              role="img"
              aria-label={`RC 充电曲线，时间常数 ${fmt(result.tau)} 秒，终值 ${vin} 伏`}
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart
                  data={result.points}
                  margin={{ top: 16, right: 20, left: 0, bottom: 18 }}
                >
                  <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={[0, 5 * result.tau]}
                    tickFormatter={(n) => fmt(n)}
                    label={{
                      value: "时间 t / s",
                      position: "insideBottom",
                      offset: -12,
                    }}
                  />
                  <YAxis
                    tickFormatter={(n) => fmt(n)}
                    width={45}
                    label={{
                      value: "uC / V",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${fmt(Number(value))} V`,
                      "电容电压",
                    ]}
                    labelFormatter={(value) => `t = ${fmt(Number(value))} s`}
                    contentStyle={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: 8,
                      color: "var(--text)",
                    }}
                  />
                  <ReferenceLine
                    x={result.tau}
                    stroke="var(--muted)"
                    strokeDasharray="4 4"
                    label="τ"
                  />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      )}
      <Formula
        description="第5版 p.148；零初始电压的直流充电响应。"
        latex={"u_C=U_S\\left(1-e^{-t/\\tau}\\right),\\quad\\tau=RC"}
      />
    </section>
  );
}
