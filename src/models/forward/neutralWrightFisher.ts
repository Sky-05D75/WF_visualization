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
    return {
      generation: state.generation + 1,
      alleleCount: sampleBinomial(copies, state.alleleCount / copies, random),
    };
  },
};
