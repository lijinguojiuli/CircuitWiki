export function ohm(values: { u?: number; i?: number; r?: number }) {
  let { u, i, r } = values;
  if (Object.values(values).filter((v) => v !== undefined).length !== 2)
    throw new Error("请填写恰好两个已知量，并清空待求量。");
  if (Object.values(values).some((v) => v !== undefined && !Number.isFinite(v)))
    throw new Error("请输入有限数值。");
  if (r !== undefined && r <= 0) throw new Error("电阻必须大于 0 Ω。");
  if (u === undefined) u = i! * r!;
  else if (i === undefined) i = u / r!;
  else {
    if (i === 0) throw new Error("电流为零时无法由 U/I 唯一确定电阻。");
    r = u / i;
    if (r <= 0)
      throw new Error("无源电阻的电压与电流应取关联方向，求得电阻须大于零。");
  }
  const p = u * i!;
  if (![u, i, r, p].every(Number.isFinite))
    throw new Error("计算结果超出数值范围，请减小输入。");
  return { u, i: i!, r: r!, p };
}
export function rcResponse(r: number, cMicro: number, vin: number) {
  if (![r, cMicro, vin].every(Number.isFinite) || r <= 0 || cMicro <= 0)
    throw new Error("R、C 必须为有限正数，输入电压须为有限数值。");
  const tau = r * cMicro * 1e-6;
  if (!Number.isFinite(tau) || tau <= 0 || !Number.isFinite(5 * tau))
    throw new Error("时间常数超出数值范围。");
  return {
    tau,
    points: Array.from({ length: 101 }, (_, k) => ({
      time: (5 * tau * k) / 100,
      voltage: vin * -Math.expm1((-5 * k) / 100),
    })),
  };
}
export type Complex = { re: number; im: number };
export function polar(magnitude: number, angle: number): Complex {
  if (!Number.isFinite(magnitude) || !Number.isFinite(angle) || magnitude < 0)
    throw new Error("幅值必须非负，相位必须为有限数值。");
  const rad = ((angle % 360) * Math.PI) / 180;
  return { re: magnitude * Math.cos(rad), im: magnitude * Math.sin(rad) };
}
export function rectangular(re: number, im: number) {
  if (!Number.isFinite(re) || !Number.isFinite(im))
    throw new Error("实部与虚部必须为有限数值。");
  const magnitude = Math.hypot(re, im);
  if (!Number.isFinite(magnitude)) throw new Error("结果超出数值范围。");
  return {
    magnitude,
    angle: magnitude === 0 ? null : (Math.atan2(im, re) * 180) / Math.PI,
  };
}
export function combine(
  a: Complex,
  b: Complex,
  operation: "add" | "subtract",
): Complex {
  return {
    re: a.re + (operation === "add" ? b.re : -b.re),
    im: a.im + (operation === "add" ? b.im : -b.im),
  };
}
export function fmt(n: number) {
  // Preserve small physical values (for example pF-scale time constants).
  return n === 0 ? "0" : Number(n.toPrecision(6)).toString();
}
