export type ComplexPair = [number, number];
export type ProblemCheck =
  | {
      kind: "polar";
      real: number;
      imag: number;
      magnitude: number;
      angleDegrees: number;
    }
  | {
      kind: "topology";
      edges: [string, string][];
      expectedNodes: number;
      expectedBranches: number;
      expectedKCL: number;
      expectedKVL: number;
    }
  | {
      kind: "exponentialIntegral";
      amplitude: number;
      rate: number;
      time: number;
      expected: number;
    }
  | {
      kind: "equivalentNetwork";
      family: "C" | "L" | "R";
      terminals: [string, string];
      branches: { from: string; to: string; value: number }[];
      expected: number;
    }
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
  nodes: { id: string; x: number; y: number; labelOffset?: [number, number] }[];
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
      | "inductor"
      | "wire"
      | "open"
      | "element";
    // Plain wires and unspecified two-terminal elements appear in textbook models.
    label: string;
    via?: [number, number][];
    symbolSegment?: number;
    polaritySide?: 1 | -1;
    labelOffset?: [number, number];
  }[];
  ground: string | null;
  arrows?: { from: [number, number]; to: [number, number]; label: string }[];
  notes?: { x: number; y: number; text: string }[];
  caption?: string;
  emphasis?: number[];
};
export type WorkedFigure =
  | { kind: "circuit"; title: string; network: ProblemNetwork }
  | { kind: "phasor"; title: string; group: ProblemPhasors }
  | {
      kind: "plot";
      title: string;
      xLabel: string;
      yLabel: string;
      yDomain?: ComplexPair;
      series: { label: string; points: ComplexPair[] }[];
    };
export type WorkedStep = {
  title: string;
  latex: string;
  explanation: string;
  figure?: WorkedFigure;
  action?: string;
  reasoning?: string[];
  check?: string;
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
  difficulty:
    "综合提高" | "综合挑战" | "教材习题" | "教材例题" | "教材图解练习";
  secondary: boolean;
  given: string;
  tasks: string[];
  hints: string[];
  steps: WorkedStep[];
  answer: string;
  checks: ProblemCheck[];
  network: ProblemNetwork | null;
  phasors?: ProblemPhasors[];
  source?: {
    exercise: string;
    pages: string;
    note: string;
    kind?: "exercise" | "example" | "figure";
  };
  takeaway?: string;
  networks?: { title: string; network: ProblemNetwork }[];
};
