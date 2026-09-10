import type { RandomSource } from "../shared/random";

export interface ForwardModel<State, Parameters> {
  readonly id: string;
  step(
    state: Readonly<State>,
    parameters: Readonly<Parameters>,
    random: RandomSource,
  ): State;
}
export interface NeutralParameters {
  readonly populationSize: number;
}
export interface AlleleCountState {
  readonly generation: number;
  readonly alleleCount: number;
}
export interface NeutralRunParameters extends NeutralParameters {
  readonly initialAlleleCount: number;
  readonly generations: number;
  readonly seed: number;
}
