import presets from "./starter-circuits.json";
import type { CircuitPreset, CircuitDocument } from "./types";
export const starterCircuits = presets as unknown as CircuitPreset[];
export const emptyCircuit = (): CircuitDocument => ({
  version: 1,
  title: "我的电路",
  gridSize: 20,
  components: [],
  wires: [],
  junctions: [],
  grounds: [],
});
