import { sampleBinomial } from "../shared/binomial";
import type {
  AlleleCountState,
  ForwardModel,
  NeutralParameters,
} from "./types";

export const neutralWrightFisher: ForwardModel<
  AlleleCountState,
  NeutralParameters
> = {
  id: "classical-diploid-neutral-wf-v1",
  step(state, parameters, random) {
    validateState(state, parameters);
    const copies = 2 * parameters.populationSize;
    return {
      generation: state.generation + 1,
      alleleCount: sampleBinomial(copies, state.alleleCount / copies, random),
    };
  },
};

export function validateState(
  state: Readonly<AlleleCountState>,
  parameters: Readonly<NeutralParameters>,
) {
  const copies = 2 * parameters.populationSize;
  if (
    !Number.isSafeInteger(copies) ||
    !Number.isInteger(parameters.populationSize) ||
    copies < 2 ||
    !Number.isInteger(state.alleleCount) ||
    state.alleleCount < 0 ||
    state.alleleCount > copies ||
    !Number.isSafeInteger(state.generation) ||
    state.generation < 0 ||
    state.generation >= Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError("无效的 Wright–Fisher 状态或种群大小。");
  }
}
