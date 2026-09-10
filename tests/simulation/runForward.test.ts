import { describe, expect, it } from "vitest";
import { runForward } from "../../src/simulation/runForward";
import { validateRun } from "../../src/models/forward/validate";
const parameters = {
  populationSize: 10,
  initialAlleleCount: 10,
  generations: 100,
  seed: 42,
};
describe("experiment runs", () => {
  it("includes generation zero, reproduces trajectories and isolates parameter snapshots", () => {
    const input = { ...parameters };
    const a = runForward(input);
    expect(a).toEqual(runForward(input));
    expect(a.trajectory).toHaveLength(101);
    expect(a.trajectory[0]).toEqual({ generation: 0, alleleCount: 10 });
    expect(a.trajectory[100].generation).toBe(100);
    input.populationSize = 20;
    expect(a.parameters.populationSize).toBe(10);
    expect(Object.isFrozen(a.parameters)).toBe(true);
    expect(a.trajectory).not.toEqual(
      runForward({ ...parameters, seed: 43 }).trajectory,
    );
  });
  it.each([0, 20])(
    "recognizes initial absorption at count %i and extends the plateau to T",
    (x) => {
      const result = runForward({ ...parameters, initialAlleleCount: x });
      expect(result.absorption).toEqual({
        kind: x === 0 ? "lost" : "fixed",
        generation: 0,
      });
      expect(result.trajectory.every((state) => state.alleleCount === x)).toBe(
        true,
      );
    },
  );
  it("records the first absorption and never leaves the boundary", () => {
    const result = runForward({
      populationSize: 1,
      initialAlleleCount: 1,
      generations: 100,
      seed: 42,
    });
    expect(result.absorption).not.toBeNull();
    const time = result.absorption!.generation;
    expect(result.trajectory[time - 1].alleleCount).toBe(1);
    expect(
      result.trajectory
        .slice(time)
        .every(
          (state) => state.alleleCount === result.trajectory[time].alleleCount,
        ),
    ).toBe(true);
  });
  it("distinguishes an unabsorbed endpoint", () => {
    expect(runForward({ ...parameters, generations: 1 }).absorption).toBeNull();
  });
  it("validates empty/nonfinite, fractional and excessive runs before sampling", () => {
    for (const patch of [
      { populationSize: NaN },
      { generations: 1.2 },
      { initialAlleleCount: 21 },
      { seed: -1 },
      { populationSize: 2000, generations: 2000 },
    ]) {
      expect(validateRun({ ...parameters, ...patch }).length).toBeGreaterThan(
        0,
      );
      expect(() => runForward({ ...parameters, ...patch })).toThrow();
    }
  });
});
