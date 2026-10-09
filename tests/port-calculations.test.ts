import test from "node:test";
import assert from "node:assert/strict";
import { bridgeEquivalent } from "../src/lib/port-calculations";
const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
test("bridge open-circuit, short-circuit and loaded equivalents agree with KCL", () => {
  const result = bridgeEquivalent(6, 4, 2000, 3000);
  near(result.uoc, 14);
  near(result.req, 2000);
  near(result.isc, 0.007);
  near(result.uoc / result.isc, result.req);
  near(result.current, 0.0028);
  near(result.voltage, 8.4);
  near(0.004 - result.resistorCurrent, result.current);
  near(result.voltage, result.uoc - result.req * result.current);
});
test("bridge signs allow reverse current and cancelling independent sources", () => {
  const reverse = bridgeEquivalent(6, -4, 2000, 3000);
  near(reverse.uoc, -2);
  near(reverse.current, -0.0004);
  near(-0.004 - reverse.resistorCurrent, reverse.current);
  const cancelled = bridgeEquivalent(-8, 4, 2000, 3000);
  near(cancelled.uoc, 0);
  near(cancelled.isc, 0);
  near(cancelled.req, 2000);
});
test("bridge rejects invalid resistance and non-finite parameters", () => {
  for (const args of [
    [6, 4, 0, 3000],
    [6, 4, 2000, -1],
    [Infinity, 4, 2000, 3000],
    [6, NaN, 2000, 3000],
  ])
    assert.throws(() =>
      bridgeEquivalent(...(args as [number, number, number, number])),
    );
});
