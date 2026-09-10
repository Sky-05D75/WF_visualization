import type {
  AlleleCountState,
  NeutralRunParameters,
} from "../models/forward/types";
export type Absorption = {
  readonly kind: "fixed" | "lost";
  readonly generation: number;
};
export interface NeutralResult {
  readonly modelId: string;
  readonly randomAlgorithm: string;
  readonly parameters: Readonly<NeutralRunParameters>;
  readonly trajectory: readonly Readonly<AlleleCountState>[];
  readonly absorption: Absorption | null;
}
