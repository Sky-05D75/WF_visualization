import type {
  AlleleCountState,
  EvolutionParameters,
  ForwardModel,
} from "./types";
import { validateState } from "./neutralWrightFisher";
import { applySelection } from "./processes/selection";
import { applyMutation } from "./processes/mutation";
import { sampleBinomial } from "../shared/binomial";

export function generationProbabilities(
  p: number,
  parameters: EvolutionParameters,
) {
  const afterSelection = applySelection(p, parameters.selection);
  const afterMutation = applyMutation(afterSelection, parameters.mutation);
  return { afterSelection, afterMutation };
}
export const evolutionWrightFisher: ForwardModel<
  AlleleCountState,
  EvolutionParameters
> = {
  id: "diploid-selection-mutation-wf-v2",
  step(state, parameters, random) {
    validateState(state, parameters);
    const copies = 2 * parameters.populationSize;
    const { afterMutation } = generationProbabilities(
      state.alleleCount / copies,
      parameters,
    );
    return {
      generation: state.generation + 1,
      alleleCount: sampleBinomial(copies, afterMutation, random),
    };
  },
};
