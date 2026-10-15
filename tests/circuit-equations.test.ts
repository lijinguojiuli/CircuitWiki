import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import {
  starterCircuits,
  emptyCircuit,
} from "../src/lib/circuit-equations/examples";
import {
  detectTopology,
  detectMeshes,
  independentLoops,
} from "../src/lib/circuit-equations/topology";
import {
  analyzeCircuit,
  matrixLatex,
} from "../src/lib/circuit-equations/solver";
import { solveMatrix } from "../src/lib/circuit-equations/matrix-solver";
import {
  addComponent,
  parseDocument,
  repositionComponent,
} from "../src/lib/circuit-equations/geometry";
import {
  componentTerminals,
  serializeNetlist,
} from "../src/lib/circuit-equations/model";
import { circuitLearningContext } from "../src/lib/circuit-equations/assistant-context";
import { searchContent } from "../src/lib/search";
import type { CircuitDocument } from "../src/lib/circuit-equations/types";
const document = (i = 0) => structuredClone(starterCircuits[i].document);
const close = (a: number, b: number, tolerance = 1e-8) =>
  assert.ok(
    Math.abs(a - b) < tolerance * Math.max(1, Math.abs(b)),
    `${a} != ${b}`,
  );
function solve(
  d: CircuitDocument,
  method: "nodal" | "mesh" | "auto" = "nodal",
) {
  const topology = detectTopology(d),
    a = analyzeCircuit(topology, method);
  assert.equal(a.status, "solved", a.error ?? "should solve");
  assert.ok(a.residual! < 1e-8);
  close(a.powerBalance!, 0);
  for (const node of topology.netlist.nodes) {
    let sum = 0;
    topology.netlist.components.forEach((c, i) => {
      sum +=
        (c.nodes[0] === node.id ? 1 : 0) * a.branches[i].current -
        (c.nodes[1] === node.id ? 1 : 0) * a.branches[i].current;
      close(
        a.voltages[c.nodes[0]] - a.voltages[c.nodes[1]],
        a.branches[i].voltage,
      );
    });
    close(sum, 0);
  }
  return a;
}
test("both methods derive resistor-divider values and update from changed parameters", () => {
  for (const method of ["nodal", "mesh"] as const) {
    const d = document();
    let a = solve(d, method);
    close(a.branches.find((b) => b.id === "R2")!.voltage, 8);
    close(a.branches.find((b) => b.id === "V1")!.current, -0.002);
    d.components.find((c) => c.id === "R2")!.value = 2000;
    a = solve(d, method);
    close(a.branches.find((b) => b.id === "R2")!.voltage, 6);
  }
});
test("grounded and floating independent sources work with KCL and mesh current constraints", () => {
  for (const i of [1, 2])
    for (const method of ["nodal", "mesh"] as const) {
      const a = solve(document(i), method);
      close(
        a.branches.find((b) => b.id === "R2")!.voltage,
        i === 1 ? 28 / 3 : -1.2,
      );
      close(
        a.branches.find((b) => b.id === "I1")!.current,
        i === 1 ? 0.001 : 0.002,
      );
    }
  const d = document(1);
  const r = d.components.find((c) => c.id === "R2")!;
  r.type = "current-source";
  r.id = "I2";
  r.value = 0.001;
  for (const method of ["nodal", "mesh"] as const) {
    const a = solve(d, method);
    close(a.branches.find((b) => b.id === "I2")!.voltage, 12);
    close(a.branches.find((b) => b.id === "R1")!.current, 0);
  }
});
test("twenty varied source and resistance combinations agree across independent formulations", () => {
  for (let i = 1; i <= 20; i++) {
    const d = document((i % 2) + 1);
    d.components.forEach(
      (c, j) =>
        (c.value =
          c.type === "resistor"
            ? 100 * (i + 2) * (j + 1)
            : c.type === "voltage-source"
              ? ((i % 3) - 1) * 3.7
              : ((i % 5) - 2) * 0.0004),
    );
    const n = solve(d, "nodal"),
      m = solve(d, "mesh");
    n.branches.forEach((b, j) => {
      close(b.current, m.branches[j].current);
      close(b.voltage, m.branches[j].voltage);
    });
  }
});
test("automatic analysis chooses a single mesh or general nodal analysis with a reason", () => {
  assert.equal(solve(document(), "auto").method, "mesh");
  assert.equal(solve(document(1), "auto").method, "nodal");
});
test("crossing wires remain distinct; T ends and explicit junctions connect", () => {
  let d = emptyCircuit();
  d = addComponent(d, "resistor", [200, 200]);
  d = addComponent(d, "resistor", [400, 400]);
  d.wires = [
    {
      id: "W1",
      points: [
        [240, 200],
        [600, 200],
      ],
    },
    {
      id: "W2",
      points: [
        [360, 400],
        [360, 100],
      ],
    },
  ];
  let t = detectTopology(d);
  assert.notEqual(
    t.netlist.components[0].nodes[1],
    t.netlist.components[1].nodes[0],
  );
  assert.ok(t.crossings.length);
  d.junctions = [[360, 200]];
  t = detectTopology(d);
  assert.equal(
    t.netlist.components[0].nodes[1],
    t.netlist.components[1].nodes[0],
  );
  d.junctions = [];
  d.wires[1].points = [
    [360, 400],
    [360, 200],
  ];
  t = detectTopology(d);
  assert.equal(
    t.netlist.components[0].nodes[1],
    t.netlist.components[1].nodes[0],
  );
});
test("ground choice is deterministic, and detached grounds or circuit islands are diagnosed", () => {
  const d = document();
  d.grounds = [];
  const t = detectTopology(d);
  assert.equal(t.netlist.referenceNodeId, "N0");
  assert.match(t.referenceReason, /自动/);
  solve(d);
  d.grounds = [{ id: "G1", position: [800, 500] }];
  assert.match(analyzeCircuit(detectTopology(d)).error!, /接到/);
  const island = addComponent(document(), "resistor", [800, 400]);
  assert.match(analyzeCircuit(detectTopology(island)).error!, /子电路/);
});
test("moving and rotating attached components preserve electrical connectivity", () => {
  let d = document();
  d = repositionComponent(d, "R1", [280, 180]);
  close(solve(d).branches.find((b) => b.id === "R2")!.voltage, 8);
  d = repositionComponent(d, "R1", [280, 180], 90);
  close(solve(d).branches.find((b) => b.id === "R2")!.voltage, 8);
  const source = document();
  source.components[0].rotation = 270;
  close(solve(source).branches.find((b) => b.id === "R2")!.voltage, -8);
});
test("conflicting parallel voltage sources and a shorted nonzero source cannot produce fake answers", () => {
  const d = document();
  d.components.push({
    id: "V2",
    name: "第二电压源",
    type: "voltage-source",
    value: 13,
    position: [600, 240],
    rotation: 90,
  });
  d.wires.push(
    {
      id: "W4",
      points: [
        [600, 200],
        [120, 200],
      ],
    },
    {
      id: "W5",
      points: [
        [600, 280],
        [120, 280],
      ],
    },
  );
  assert.match(analyzeCircuit(detectTopology(d), "nodal").error!, /冲突/);
  d.components.at(-1)!.value = 12;
  assert.match(analyzeCircuit(detectTopology(d), "nodal").error!, /唯一/);
  const shorted = document();
  shorted.wires.push({
    id: "W4",
    points: [
      [120, 200],
      [120, 280],
    ],
  });
  assert.match(analyzeCircuit(detectTopology(shorted), "nodal").error!, /冲突/);
});
test("an open current source and a redundant zero-volt short report meaningful diagnostics", () => {
  let d = emptyCircuit();
  d = addComponent(d, "current-source", [200, 240]);
  assert.match(analyzeCircuit(detectTopology(d), "nodal").error!, /冲突/);
  const z = document();
  z.components[0].value = 0;
  z.wires.push({
    id: "W4",
    points: [
      [120, 200],
      [120, 280],
    ],
  });
  assert.match(analyzeCircuit(detectTopology(z), "nodal").error!, /唯一/);
  for (const v of [0, -12]) {
    const d = document();
    d.components[0].value = v;
    close(solve(d).branches.find((b) => b.id === "R2")!.voltage, (v * 2) / 3);
  }
});
test("shorted current sources and resistors retain their defined branch quantities without unknown voltages", () => {
  let d = addComponent(emptyCircuit(), "current-source", [200, 240]);
  d.wires = [
    {
      id: "W1",
      points: [
        [200, 280],
        [320, 280],
        [320, 200],
        [200, 200],
      ],
    },
  ];
  let a = solve(d);
  close(a.branches[0].current, 0.001);
  close(a.branches[0].voltage, 0);
  d = addComponent(emptyCircuit(), "resistor", [200, 240]);
  d.wires = [
    {
      id: "W1",
      points: [
        [160, 240],
        [160, 320],
        [240, 320],
        [240, 240],
      ],
    },
  ];
  a = solve(d);
  close(a.branches[0].current, 0);
});
test("fundamental cycles and geometric meshes have zero node incidence and the right rank", () => {
  for (const preset of starterCircuits) {
    const t = detectTopology(preset.document);
    const loops = independentLoops(t.netlist);
    assert.equal(loops.length, t.loopCount);
    assert.equal(detectMeshes(t).meshes.length, t.loopCount);
    for (const row of loops)
      for (const n of t.netlist.nodes) {
        let incidence = 0;
        t.netlist.components.forEach(
          (c, k) =>
            (incidence +=
              row[k] *
              ((c.nodes[0] === n.id ? 1 : 0) - (c.nodes[1] === n.id ? 1 : 0))),
        );
        assert.equal(incidence, 0);
      }
  }
});
test("pivot elimination distinguishes unique, inconsistent and nonunique systems including tiny conductances", () => {
  for (const scale of [1, 1e-15, 1e15]) {
    const r = solveMatrix(
      [
        [2 * scale, scale],
        [scale, 3 * scale],
      ],
      [5 * scale, 10 * scale],
    );
    assert.equal(r.status, "unique");
    if (r.status === "unique") {
      close(r.values[0], 1);
      close(r.values[1], 3);
    }
  }
  assert.equal(
    solveMatrix(
      [
        [1, 1],
        [2, 2],
      ],
      [1, 3],
    ).status,
    "inconsistent",
  );
  assert.equal(
    solveMatrix(
      [
        [1, 1],
        [2, 2],
      ],
      [1, 2],
    ).status,
    "underdetermined",
  );
  assert.throws(() => solveMatrix([[Infinity]], [1]));
  const large = document();
  large.components
    .filter((c) => c.type === "resistor")
    .forEach((c) => (c.value *= 1e9));
  close(solve(large).branches.find((b) => b.id === "R2")!.voltage, 8);
});
test("generated equations, matrices and teaching expressions render with strict math", () => {
  for (const p of starterCircuits)
    for (const method of ["nodal", "mesh"] as const) {
      const a = solve(p.document, method);
      for (const eq of [
        ...a.equations,
        ...a.steps.flatMap((s) => s.equations),
        { latex: matrixLatex(a.matrix!) },
      ])
        assert.doesNotThrow(() =>
          katex.renderToString(eq.latex, {
            strict: "error",
            throwOnError: true,
          }),
        );
    }
});
test("drawing import validates data, rejects unknown types and preserves the SI netlist export", () => {
  const d = document();
  assert.deepEqual(parseDocument(JSON.parse(JSON.stringify(d))), d);
  const t = detectTopology(d);
  const net = JSON.parse(serializeNetlist(t.netlist));
  assert.equal(net.components[1].value, 2000);
  assert.ok(!("position" in net.components[1]));
  assert.deepEqual(componentTerminals(d.components[0]), [
    [120, 200],
    [120, 280],
  ]);
  for (const mutate of [
    (x: CircuitDocument) => (x.components[0].value = Infinity),
    (x: CircuitDocument) => (x.components[1].value = 0),
    (x: CircuitDocument) => (x.components[0].id = "x}\\href"),
    (x: CircuitDocument) => (x.components[0].type = "toString" as never),
    (x: CircuitDocument) =>
      (x.wires[0].points = [
        [1, 1],
        [10, 10],
      ]),
  ]) {
    const invalid = document();
    mutate(invalid);
    assert.throws(() => parseDocument(invalid));
  }
  assert.throws(() => parseDocument(t.netlist));
});
test("reserved teaching context contains computed results and search points to the live tool", () => {
  const t = detectTopology(document()),
    a = analyzeCircuit(t);
  const context = circuitLearningContext(t, a);
  assert.equal(context.status, "solved");
  assert.equal(context.results!.branches.length, 3);
  assert.equal(searchContent("电路方程自动生成器")[0].href, "/tools/equations");
});
test("overflow is a diagnostic, never a NaN or Infinity result table", () => {
  const d = document();
  d.components[0].value = 1e250;
  d.components
    .filter((c) => c.type === "resistor")
    .forEach((c) => (c.value = 1));
  const a = analyzeCircuit(detectTopology(d), "nodal");
  assert.equal(a.status, "error");
  assert.equal(a.branches.length, 0);
});
