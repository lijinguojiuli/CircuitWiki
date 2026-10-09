import test from "node:test";
import assert from "node:assert/strict";
import {
  seriesPhasors,
  threePhaseLoad,
  sinusoid,
} from "../src/lib/learning-calculations";
const close = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b)), `${a} != ${b}`);
test("phasor polygon agrees with impedance and capacitive phase direction", () => {
  const rl = seriesPhasors(30, 40, 0);
  close(rl.magnitude, 50);
  close(rl.angle, 53.13010235415598);
  const rc = seriesPhasors(30, 0, 40);
  close(rc.angle, -rl.angle);
  const resonance = seriesPhasors(30, 40, 40);
  close(resonance.magnitude, 30);
  close(resonance.angle, 0);
  assert.throws(() => seriesPhasors(0, 1, 1));
  assert.throws(() => seriesPhasors(1, -1, 1));
});
test("Y and delta use distinct phase quantities but share the line-power law", () => {
  const star = threePhaseLoad(380, 30, 30, "star"),
    delta = threePhaseLoad(380, 30, 30, "delta");
  close(delta.lineCurrent, 3 * star.lineCurrent);
  close(delta.active, 3 * star.active);
  const equivalent = threePhaseLoad(380, 90, 30, "delta");
  close(equivalent.lineCurrent, star.lineCurrent);
  close(
    star.active,
    Math.sqrt(3) * 380 * star.lineCurrent * Math.cos(Math.PI / 6),
  );
  close(star.apparent ** 2, star.active ** 2 + star.reactive ** 2);
  assert.ok(threePhaseLoad(380, 30, -30, "star").reactive < 0);
  assert.throws(() => threePhaseLoad(380, 0, 30, "star"));
  assert.throws(() => threePhaseLoad(380, 30, 91, "star"));
});
test("sinusoidal evaluation respects rms, units, time and phase periodicity", () => {
  const r = sinusoid(10, 50, 30, 0);
  close(r.rms, 10 / Math.sqrt(2));
  close(r.period, 0.02);
  close(r.value, 5 * Math.sqrt(3));
  close(sinusoid(10, 50, 390, 0).value, r.value);
  close(sinusoid(10, 50, 30, 0.005).value, -5);
  close(sinusoid(10 * Math.sqrt(2), 50, -30, 0.005).value, 5 * Math.sqrt(2));
  assert.throws(() => sinusoid(10, 0, 0, 0));
  assert.throws(() => sinusoid(-1, 50, 0, 0));
});
