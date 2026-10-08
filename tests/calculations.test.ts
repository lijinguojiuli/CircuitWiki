import test from "node:test";
import assert from "node:assert/strict";
import {
  ohm,
  rcResponse,
  polar,
  rectangular,
  combine,
  fmt,
} from "../src/lib/calculations";
const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
test("small physical values remain nonzero when formatted", () => {
  assert.equal(fmt(1e-15), "1e-15");
  assert.equal(fmt(-0), "0");
});
test("Ohm law solves each pair and balances resistor power", () => {
  for (const values of [
    { u: 12, r: 1000 },
    { i: 0.012, r: 1000 },
    { u: 12, i: 0.012 },
  ]) {
    const result = ohm(values);
    near(result.u, 12);
    near(result.i, 0.012);
    near(result.r, 1000);
    near(result.p, 0.144);
    near(result.p, result.i ** 2 * result.r);
  }
});
test("Ohm law rejects underdetermined, overdetermined and invalid inputs", () => {
  for (const values of [
    { u: 1 },
    { u: 1, i: 1, r: 1 },
    { u: 0, i: 0 },
    { u: 2, r: 0 },
    { u: 2, r: -1 },
    { u: Infinity, r: 2 },
    { u: 2, i: -1 },
  ])
    assert.throws(() => ohm(values));
});
test("zero voltage with known positive resistance is well defined", () =>
  assert.deepEqual(ohm({ u: 0, r: 100 }), { u: 0, i: 0, r: 100, p: 0 }));
test("RC units, initial condition, one tau and five tau", () => {
  const { tau, points } = rcResponse(1000, 100, 5);
  near(tau, 0.1);
  near(points[0].voltage, 0);
  near(points[20].time, tau);
  near(points[20].voltage, 5 * (1 - Math.exp(-1)));
  near(points[100].voltage, 5 * (1 - Math.exp(-5)));
  assert.ok(
    points.every((p, i) => i === 0 || p.voltage >= points[i - 1].voltage),
  );
  near(rcResponse(2000, 100, 5).tau, 0.2);
});
test("RC rejects invalid storage parameters", () => {
  assert.throws(() => rcResponse(0, 10, 5));
  assert.throws(() => rcResponse(10, -1, 5));
  assert.throws(() => rcResponse(10, 1, NaN));
});
test("phasor conversion roundtrips quadrants", () => {
  for (const angle of [-150, -45, 30, 135]) {
    const c = polar(10, angle);
    const p = rectangular(c.re, c.im);
    near(p.magnitude, 10);
    near(p.angle!, angle);
  }
});
test("phasor sum, difference and zero phase", () => {
  const a = { re: 3, im: 4 },
    b = { re: 1, im: 2 };
  assert.deepEqual(combine(a, b, "add"), { re: 4, im: 6 });
  assert.deepEqual(combine(a, b, "subtract"), { re: 2, im: 2 });
  assert.equal(rectangular(0, 0).angle, null);
  near(rectangular(3, 4).magnitude, 5);
  assert.throws(() => polar(-1, 0));
});
