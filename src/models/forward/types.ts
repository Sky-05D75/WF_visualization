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

export interface SelectionParameters {
  readonly enabled: boolean;
  readonly s: number;
  readonly h: number;
}
export interface MutationParameters {
  readonly enabled: boolean;
  /** A -> a probability per generation. */
  readonly mu: number;
  /** a -> A probability per generation. */
  readonly nu: number;
}
export interface EvolutionParameters extends NeutralParameters {
  readonly selection?: SelectionParameters;
  readonly mutation?: MutationParameters;
}
export interface RunParameters
  extends NeutralRunParameters, EvolutionParameters {}
