"use client";
import { useState } from "react";
import { bridgeEquivalent } from "@/lib/port-calculations";
import { fmt } from "@/lib/calculations";
import { Field, ErrorMessage } from "./fields";
import { BridgePortDiagram, type BridgeMode } from "../bridge-port-diagram";
export function BridgePortLab() {
  const [us, setUs] = useState("6"),
    [is, setIs] = useState("4"),
    [r, setR] = useState("2000"),
    [rl, setRl] = useState("3000"),
    [mode, setMode] = useState<BridgeMode>("open");
  let result: ReturnType<typeof bridgeEquivalent> | undefined,
    error = "";
  try {
    if ([us, is, r, rl].some((v) => v === ""))
      throw new Error("请填写所有电源与电阻参数。");
    result = bridgeEquivalent(Number(us), Number(is), Number(r), Number(rl));
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <section className="bridge-port-lab">
      <h3>切换端口状态，核对等效参数</h3>
      <div className="fields phasor-fields">
        <Field label="电压源 US" unit="V" value={us} onChange={setUs} />
        <Field label="电流源 IS" unit="mA" value={is} onChange={setIs} />
        <Field label="并联电阻 R" unit="Ω" value={r} onChange={setR} />
        <Field label="负载电阻 RL" unit="Ω" value={rl} onChange={setRl} />
      </div>
      <div className="segmented">
        {(
          [
            { id: "open", label: "开路" },
            { id: "short", label: "短路" },
            { id: "resistance", label: "源置零" },
            { id: "loaded", label: "带载" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <BridgePortDiagram mode={mode} />
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        result && (
          <div className="port-results" aria-live="polite">
            <p>
              <strong>
                原网络：uoc = {fmt(result.uoc)} V；Req = {fmt(result.req)}{" "}
                Ω；isc = {fmt(result.isc * 1000)} mA
              </strong>
            </p>
            <p>
              {mode === "open"
                ? `端口电流为0；A对B电压为${fmt(result.uoc)} V。内部R中按A→X定义的电流为${is} mA。`
                : mode === "short"
                  ? `A、B被短接，端口电压为0；短路电流为${fmt(result.isc * 1000)} mA。`
                  : mode === "resistance"
                    ? `独立源置零后，从A-B端口看进去只有R，因此输入电阻为${fmt(result.req)} Ω。上列uoc、isc属于原网络。`
                    : `负载电流为${fmt(result.current * 1000)} mA，负载电压为${fmt(result.voltage)} V。R中按A→X定义的电流为${fmt(result.resistorCurrent * 1000)} mA。`}
            </p>
          </div>
        )
      )}
    </section>
  );
}
