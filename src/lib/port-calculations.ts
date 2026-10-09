export function bridgeEquivalent(
  us: number,
  isMilli: number,
  r: number,
  rl: number,
) {
  if (![us, isMilli, r, rl].every(Number.isFinite) || r <= 0 || rl <= 0)
    throw new Error("电阻与负载电阻须为有限正数，电源参数须为有限数值。");
  const is = isMilli / 1000,
    uoc = us + is * r,
    isc = uoc / r,
    current = uoc / (r + rl),
    voltage = current * rl;
  if (![is, uoc, isc, current, voltage].every(Number.isFinite))
    throw new Error("计算结果超出数值范围。");
  return {
    uoc,
    req: r,
    isc,
    current,
    voltage,
    resistorCurrent: (voltage - us) / r,
  };
}
