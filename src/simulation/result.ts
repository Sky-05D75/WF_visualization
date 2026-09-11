import type { AlleleCountState, RunParameters } from "../models/forward/types";
export type Absorption = {
  readonly kind: "fixed" | "lost";
  readonly generation: number;
};
export interface SimulationResult {
  readonly modelId: string;
  readonly randomAlgorithm: string;
  readonly parameters: Readonly<RunParameters>;
  readonly trajectory: readonly Readonly<AlleleCountState>[];
  readonly firstBoundary: Absorption | null;
  readonly finalStatus: "fixed" | "lost" | "segregating";
  readonly absorption: Absorption | null;
}

/** Compatibility name for consumers of v0.1 results. */
export type NeutralResult = SimulationResult;
