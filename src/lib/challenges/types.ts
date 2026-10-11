export type ComplexPair = [number, number];
export type ProblemCheck =
  | { kind: "linear"; matrix: number[][]; rhs: number[]; solution: number[] }
  | {
      kind: "complexLinear";
      matrix: ComplexPair[][];
      rhs: ComplexPair[];
      solution: ComplexPair[];
    }
  | { kind: "power"; terms: [number, number][]; expected: number }
  | { kind: "number"; actual: number; expected: number }
  | {
      kind: "integral";
      intervals: { coefficients: number[]; from: number; to: number }[];
      expected: number;
    }
  | { kind: "polynomial"; coefficients: number[]; x: number; expected: number }
  | {
      kind: "capacitorEnergy";
      capacitance: number;
      voltage: number;
      expected: number;
    }
  | {
      kind: "inductorEnergy";
      inductance: number;
      current: number;
      expected: number;
    }
  | {
      kind: "coupledEnergy";
      L1: number;
      L2: number;
      M: number;
      i1: number;
      i2: number;
      expected: number;
    }
  | {
      kind: "transient";
      initial: number;
      final: number;
      tau: number;
      time: number;
      expected: number;
    }
  | {
      kind: "graph";
      nodes: string[];
      edges: [string, string][];
      cycles: number[][];
    }
  | {
      kind: "delta";
      delta: [number, number, number];
      star: [number, number, number];
    }
  | {
      kind: "acPower";
      voltage: ComplexPair;
      current: ComplexPair;
      multiplier?: number;
      expectedP: number;
      expectedQ: number;
    }
  | { kind: "resonance"; L: number; C: number; omega: number };
export type ProblemNetwork = {
  nodes: { id: string; x: number; y: number }[];
  branches: {
    from: string;
    to: string;
    kind:
      | "resistor"
      | "impedance"
      | "voltage"
      | "current"
      | "controlled-current"
      | "capacitor"
      | "inductor";
    label: string;
    via?: [number, number][];
    symbolSegment?: number;
    labelOffset?: [number, number];
  }[];
  ground: string | null;
};
export type ProblemPhasors = {
  unit: string;
  caption: string;
  vectors: { label: string; real: number; imag: number }[];
};
export type Challenge = {
  id: string;
  title: string;
  chapter: number;
  section: number;
  difficulty: "综合提高" | "综合挑战";
  secondary: boolean;
  given: string;
  tasks: string[];
  hints: string[];
  steps: { title: string; latex: string; explanation: string }[];
  answer: string;
  checks: ProblemCheck[];
  network: ProblemNetwork | null;
  phasors?: ProblemPhasors[];
};
