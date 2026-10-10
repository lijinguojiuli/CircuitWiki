export function seriesPhasors(r: number, xl: number, xc: number, current = 1) {
  if (
    ![r, xl, xc, current].every(Number.isFinite) ||
    r <= 0 ||
    xl < 0 ||
    xc < 0 ||
    current <= 0
  )
    throw new Error("R、I须为正数，感抗与容抗大小须非负。");
  const ur = r * current,
    ul = xl * current,
    uc = xc * current;
  if (![ur, ul, uc, Math.hypot(ur, ul - uc)].every(Number.isFinite))
    throw new Error("结果超出数值范围。");
  return {
    ur,
    ul,
    uc,
    reactive: ul - uc,
    magnitude: Math.hypot(ur, ul - uc),
    angle: (Math.atan2(ul - uc, ur) * 180) / Math.PI,
  };
}

// Zero reactance marks an absent L/C branch in the teaching presets.
export function parallelPhasors(
  r: number,
  xl: number,
  xc: number,
  voltage = 100,
) {
  if (
    ![r, xl, xc, voltage].every(Number.isFinite) ||
    r <= 0 ||
    xl < 0 ||
    xc < 0 ||
    voltage <= 0
  )
    throw new Error("R、U须为正数，支路电抗大小须非负。");
  const ir = voltage / r,
    il = xl === 0 ? 0 : voltage / xl,
    ic = xc === 0 ? 0 : voltage / xc;
  const reactive = ic - il,
    magnitude = Math.hypot(ir, reactive);
  if (![ir, il, ic, reactive, magnitude].every(Number.isFinite))
    throw new Error("结果超出数值范围。");
  return {
    ir,
    il,
    ic,
    reactive,
    magnitude,
    angle: (Math.atan2(reactive, ir) * 180) / Math.PI,
  };
}

export function threePhaseLoad(
  lineVoltage: number,
  impedance: number,
  angle: number,
  connection: "star" | "delta",
) {
  if (
    ![lineVoltage, impedance, angle].every(Number.isFinite) ||
    lineVoltage <= 0 ||
    impedance <= 0 ||
    Math.abs(angle) > 90
  )
    throw new Error("线电压、阻抗须为正数，无源负载角须在−90°到90°之间。");
  const phaseVoltage =
    connection === "star" ? lineVoltage / Math.sqrt(3) : lineVoltage;
  const phaseCurrent = phaseVoltage / impedance;
  const lineCurrent =
    connection === "star" ? phaseCurrent : Math.sqrt(3) * phaseCurrent;
  const apparent = 3 * phaseVoltage * phaseCurrent;
  if (
    ![phaseVoltage, phaseCurrent, lineCurrent, apparent].every(Number.isFinite)
  )
    throw new Error("结果超出数值范围。");
  return {
    phaseVoltage,
    phaseCurrent,
    lineCurrent,
    apparent,
    active: apparent * Math.cos((angle * Math.PI) / 180),
    reactive: apparent * Math.sin((angle * Math.PI) / 180),
  };
}

export function sinusoid(
  peak: number,
  frequency: number,
  phase: number,
  time: number,
) {
  if (
    ![peak, frequency, phase, time].every(Number.isFinite) ||
    peak < 0 ||
    frequency <= 0
  )
    throw new Error("峰值须非负、频率须为正，其余参数须为有限数值。");
  const omega = 2 * Math.PI * frequency,
    period = 1 / frequency,
    phaseRad = ((phase % 360) * Math.PI) / 180;
  const argument = omega * time + phaseRad;
  if (![omega, period, argument].every(Number.isFinite) || period <= 0)
    throw new Error("参数超出数值范围。");
  return {
    omega,
    period,
    rms: peak / Math.sqrt(2),
    value: peak * Math.cos(argument),
    phaseRad,
  };
}
