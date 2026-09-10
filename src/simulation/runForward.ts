import { neutralWrightFisher } from "../models/forward/neutralWrightFisher";
import type {
  NeutralRunParameters,
  AlleleCountState,
} from "../models/forward/types";
import { validateRun } from "../models/forward/validate";
import { createRandom, RANDOM_ALGORITHM } from "../models/shared/random";
import type { Absorption, NeutralResult } from "./result";

export function runForward(input: NeutralRunParameters): NeutralResult {
  const errors = validateRun(input);
  if (errors.length) throw new RangeError(errors.join(" "));
  const parameters = Object.freeze({ ...input });
  const random = createRandom(parameters.seed);
  let state: AlleleCountState = {
    generation: 0,
    alleleCount: parameters.initialAlleleCount,
  };
  const trajectory: AlleleCountState[] = [];
  let absorption: Absorption | null = null;
  for (let t = 0; t <= parameters.generations; t++) {
    if (t > 0) state = neutralWrightFisher.step(state, parameters, random);
    trajectory.push(Object.freeze(state));
    if (
      !absorption &&
      (state.alleleCount === 0 ||
        state.alleleCount === 2 * parameters.populationSize)
    ) {
      absorption = Object.freeze({
        kind: state.alleleCount === 0 ? "lost" : "fixed",
        generation: t,
      });
    }
  }
  return Object.freeze({
    modelId: neutralWrightFisher.id,
    randomAlgorithm: RANDOM_ALGORITHM,
    parameters,
    trajectory: Object.freeze(trajectory),
    absorption,
  });
}
