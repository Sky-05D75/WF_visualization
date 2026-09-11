import { evolutionWrightFisher } from "../models/forward/evolutionWrightFisher";
import { neutralWrightFisher } from "../models/forward/neutralWrightFisher";
import type { RunParameters, AlleleCountState } from "../models/forward/types";
import { validateRun } from "../models/forward/validate";
import { createRandom, RANDOM_ALGORITHM } from "../models/shared/random";
import type { Absorption, NeutralResult } from "./result";

export function runForward(input: RunParameters): NeutralResult {
  const errors = validateRun(input);
  if (errors.length) throw new RangeError(errors.join(" "));
  const parameters = Object.freeze({
    ...input,
    ...(input.selection
      ? { selection: Object.freeze({ ...input.selection }) }
      : {}),
    ...(input.mutation
      ? { mutation: Object.freeze({ ...input.mutation }) }
      : {}),
  });
  const model =
    (parameters.selection?.enabled && parameters.selection.s !== 0) ||
    (parameters.mutation?.enabled &&
      (parameters.mutation.mu !== 0 || parameters.mutation.nu !== 0))
      ? evolutionWrightFisher
      : neutralWrightFisher;
  const mu = parameters.mutation?.enabled ? parameters.mutation.mu : 0;
  const nu = parameters.mutation?.enabled ? parameters.mutation.nu : 0;
  const random = createRandom(parameters.seed);
  let state: AlleleCountState = {
    generation: 0,
    alleleCount: parameters.initialAlleleCount,
  };
  const trajectory: AlleleCountState[] = [];
  let firstBoundary: Absorption | null = null;
  let absorption: Absorption | null = null;
  for (let t = 0; t <= parameters.generations; t++) {
    if (t > 0) state = model.step(state, parameters, random);
    trajectory.push(Object.freeze(state));
    if (
      state.alleleCount === 0 ||
      state.alleleCount === 2 * parameters.populationSize
    ) {
      const boundary = Object.freeze({
        kind: state.alleleCount === 0 ? ("lost" as const) : ("fixed" as const),
        generation: t,
      });
      if (!firstBoundary) firstBoundary = boundary;
      // A boundary is absorbing only if mutation cannot reintroduce the absent allele.
      if (!absorption && (boundary.kind === "lost" ? nu === 0 : mu === 0))
        absorption = boundary;
    }
  }

  return Object.freeze({
    modelId: model.id,
    randomAlgorithm: RANDOM_ALGORITHM,
    parameters,
    trajectory: Object.freeze(trajectory),
    absorption,
    firstBoundary,
    finalStatus:
      state.alleleCount === 0
        ? "lost"
        : state.alleleCount === 2 * parameters.populationSize
          ? "fixed"
          : "segregating",
  });
}
