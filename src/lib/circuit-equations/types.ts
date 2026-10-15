/** Values use SI units. A node pair is ordered; it defines the reference direction. */
export type ComponentType = "resistor" | "voltage-source" | "current-source";
export type Rotation = 0 | 90 | 180 | 270;
export type Point = readonly [x: number, y: number];

export type CircuitComponent = {
  id: string;
  name: string;
  type: ComponentType;
  value: number;
};
export type PlacedComponent = CircuitComponent & {
  position: Point;
  rotation: Rotation;
};
/** Geometry is kept separate from electrical connectivity. Crossings are not implicit junctions. */
export type CircuitDocument = {
  version: 1;
  title: string;
  gridSize: number;
  components: PlacedComponent[];
  wires: { id: string; points: Point[] }[];
  junctions: Point[];
  grounds: { id: string; position: Point }[];
};
export type NetlistComponent = CircuitComponent & {
  /** R: current from first to second. V: first positive. I: first to second. */
  nodes: readonly [from: string, to: string];
};
export type CircuitNetlist = {
  version: 1;
  nodes: { id: string; label: string }[];
  referenceNodeId: string | null;
  components: NetlistComponent[];
};
export type EditorSelection = {
  kind: "component" | "wire" | "ground";
  id: string;
} | null;
export type EditorTool =
  "select" | "wire" | "junction" | "ground" | ComponentType;
export type EquationRow = { label: string; latex: string };
export type EquationSystem = {
  unknowns: { symbol: string; unit: "V" | "A" }[];
  coefficients: number[][];
  rhs: number[];
  rowUnits: ("A" | "V")[];
};
export type TeachingStep = {
  title: string;
  explanation: string;
  equations: EquationRow[];
};
export type CircuitPreset = {
  id: string;
  title: string;
  description: string;
  document: CircuitDocument;
};
