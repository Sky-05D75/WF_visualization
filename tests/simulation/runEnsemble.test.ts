import { describe, expect, it } from "vitest";
import {
  runEnsemble,
  validateEnsemble,
} from "../../src/simulation/runEnsemble";
const parameters = {
  populationSize: 5,
  initialAlleleCount: 5,
  generations: 20,
  seed: 42,
  replicates: 10,
};
describe("independent replicate ensembles", () => {
  it("reproduces an ensemble with distinct per-trajectory seeds and shared biological parameters", async () => {
    const a = await runEnsemble(parameters);
    expect(a).toEqual(await runEnsemble(parameters));
    expect(a.runs).toHaveLength(10);
    expect(new Set(a.runs.map((run) => run.parameters.seed)).size).toBe(10);
    expect(
      new Set(a.runs.map((run) => JSON.stringify(run.trajectory))).size,
    ).toBeGreaterThan(1);
    expect(
      a.runs.every(
        (run) =>
          run.trajectory[0].alleleCount === 5 && run.trajectory.length === 21,
      ),
    ).toBe(true);
  });
  it.each([1, 100])("accepts %i replicates", async (replicates) => {
    const result = await runEnsemble({
      ...parameters,
      replicates,
      generations: 1,
    });
    expect(result.runs).toHaveLength(replicates);
  });
  it.each([0, 101, 1.5, NaN])(
    "rejects invalid replicate count %s",
    async (replicates) => {
      expect(
        validateEnsemble({ ...parameters, replicates }).length,
      ).toBeGreaterThan(0);
      await expect(
        runEnsemble({ ...parameters, replicates }),
      ).rejects.toThrow();
    },
  );
  it("cancels between trajectories", async () => {
    const controller = new AbortController();
    const progress: number[] = [];
    await expect(
      runEnsemble(parameters, controller.signal, (n) => {
        progress.push(n);
        controller.abort();
      }),
    ).rejects.toThrow();
    expect(progress).toEqual([1]);
  });
});
