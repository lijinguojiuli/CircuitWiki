"use client";
import { useState } from "react";
import { Formula } from "../formula";
import { Field, ErrorMessage } from "./fields";
import { polar, rectangular, combine, fmt } from "@/lib/calculations";
export function PhasorCalculator() {
  const [mode, setMode] = useState<"polar" | "rect">("polar"),
    [a, setA] = useState("10"),
    [b, setB] = useState("30"),
    [c, setC] = useState("5"),
    [d, setD] = useState("0"),
    [op, setOp] = useState<"add" | "subtract">("add");
  let error = "";
  let result:
    | {
        first: ReturnType<typeof polar>;
        sum: ReturnType<typeof polar>;
        p: ReturnType<typeof rectangular>;
        f: ReturnType<typeof rectangular>;
      }
    | undefined;
  try {
    if ([a, b, c, d].includes("")) throw new Error("请填写全部相量参数。");
    const first =
      mode === "polar"
        ? polar(Number(a), Number(b))
        : { re: Number(a), im: Number(b) };
    rectangular(first.re, first.im);
    const second =
      mode === "polar"
        ? polar(Number(c), Number(d))
        : { re: Number(c), im: Number(d) };
    rectangular(second.re, second.im);
    const sum = combine(first, second, op);
    const p = rectangular(sum.re, sum.im);
    const f = rectangular(first.re, first.im);
    result = { first, sum, p, f };
  } catch (e) {
    error = (e as Error).message;
  }
  const complex = (re: number, im: number) =>
    `${fmt(re)} ${im < 0 ? "−" : "+"} j${fmt(Math.abs(im))}`;
  return (
    <section className="calculator" id="phasor">
      <div className="eyebrow">相量运算</div>
      <h2>相量计算器</h2>
      <p>
        同频相量的坐标转换与加减运算。两组相量应使用相同单位、频率与幅值约定。
      </p>
      <div className="segmented">
        <button
          aria-pressed={mode === "polar"}
          onClick={() => {
            setMode("polar");
            setA("10");
            setB("30");
            setC("5");
            setD("0");
          }}
        >
          极坐标 → 直角坐标
        </button>
        <button
          aria-pressed={mode === "rect"}
          onClick={() => {
            setMode("rect");
            setA("3");
            setB("4");
            setC("1");
            setD("2");
          }}
        >
          直角坐标 → 极坐标
        </button>
      </div>
      <div className="fields phasor-fields">
        <Field
          label={mode === "polar" ? "A 幅值" : "A 实部"}
          unit=""
          value={a}
          onChange={setA}
        />
        <Field
          label={mode === "polar" ? "A 相位" : "A 虚部"}
          unit={mode === "polar" ? "°" : "j"}
          value={b}
          onChange={setB}
        />
        <Field
          label={mode === "polar" ? "B 幅值" : "B 实部"}
          unit=""
          value={c}
          onChange={setC}
        />
        <Field
          label={mode === "polar" ? "B 相位" : "B 虚部"}
          unit={mode === "polar" ? "°" : "j"}
          value={d}
          onChange={setD}
        />
      </div>
      <label className="operation">
        运算方式{" "}
        <select
          value={op}
          onChange={(e) => setOp(e.target.value as "add" | "subtract")}
        >
          <option value="add">A + B</option>
          <option value="subtract">A − B</option>
        </select>
      </label>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <div className="phasor-output" aria-live="polite">
            <p>A 的转换结果</p>
            <strong>
              {mode === "polar"
                ? complex(result.first.re, result.first.im)
                : `${fmt(result.f.magnitude)} ∠ ${result.f.angle === null ? "未定义" : `${fmt(result.f.angle)}°`}`}
            </strong>
            <p>A {op === "add" ? "+" : "−"} B</p>
            <strong>{complex(result.sum.re, result.sum.im)}</strong>
            <p>
              = {fmt(result.p.magnitude)} ∠{" "}
              {result.p.angle === null
                ? "未定义（零相量）"
                : `${fmt(result.p.angle)}°`}
            </p>
          </div>
        )
      )}
      <Formula latex={"M\\angle\\varphi=M\\cos\\varphi+jM\\sin\\varphi"} />
    </section>
  );
}
