import type { CircuitAnalysis } from "./solver";
import type { Topology } from "./topology";
/** Reserved integration boundary. No network request, credentials or AI-generated numerical results. */
export function circuitLearningContext(
  topology: Topology,
  analysis: CircuitAnalysis,
) {
  return {
    version: 1,
    domain: "dc-linear-circuit",
    netlist: topology.netlist,
    status: analysis.status,
    method: analysis.method,
    equations: analysis.equations,
    steps: analysis.steps,
    results:
      analysis.status === "solved"
        ? {
            voltages: analysis.voltages,
            branches: analysis.branches,
            residual: analysis.residual,
            powerBalance: analysis.powerBalance,
          }
        : null,
    diagnostic: analysis.error ?? null,
  };
}
