import type { RunParameters } from "../models/forward/types";
import { validateRun } from "../models/forward/validate";
import { createRandom } from "../models/shared/random";
import { runForward } from "./runForward";
import type { NeutralResult } from "./result";

export interface EnsembleParameters extends RunParameters {
  readonly replicates: number;
}
export interface EnsembleResult {
  readonly parameters: Readonly<EnsembleParameters>;
  readonly runs: readonly NeutralResult[];
}
export function validateEnsemble(parameters: EnsembleParameters): string[] {
  const errors = validateRun(parameters);
  if (
    !Number.isInteger(parameters.replicates) ||
    parameters.replicates < 1 ||
    parameters.replicates > 100
  )
    errors.push("轨迹数 R 必须是 1–100 的整数。");
  return errors;
}
/** Yield between replicates so large ensembles remain cancellable and responsive. */
export async function runEnsemble(
  input: EnsembleParameters,
  signal?: AbortSignal,
  onProgress?: (completed: number) => void,
): Promise<EnsembleResult> {
  const errors = validateEnsemble(input);
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
  const seedSource = createRandom(parameters.seed);
  const seeds = new Set<number>();
  const runs: NeutralResult[] = [];
  for (let i = 0; i < parameters.replicates; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    signal?.throwIfAborted();
    let seed: number;
    do {
      seed = Math.floor(seedSource() * 4294967296);
    } while (seeds.has(seed));
    seeds.add(seed);
    runs.push(
      runForward({
        populationSize: parameters.populationSize,
        initialAlleleCount: parameters.initialAlleleCount,
        generations: parameters.generations,
        seed,
        selection: parameters.selection,
        mutation: parameters.mutation,
      }),
    );
    onProgress?.(runs.length);
  }
  return Object.freeze({ parameters, runs: Object.freeze(runs) });
}
