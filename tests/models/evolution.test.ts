import { describe, expect, it } from "vitest";
import { applySelection } from "../../src/models/forward/processes/selection";
import { applyMutation } from "../../src/models/forward/processes/mutation";
import {
  evolutionWrightFisher,
  generationProbabilities,
} from "../../src/models/forward/evolutionWrightFisher";
import { neutralWrightFisher } from "../../src/models/forward/neutralWrightFisher";
import { createRandom } from "../../src/models/shared/random";
import { runForward } from "../../src/simulation/runForward";
import { validateRun } from "../../src/models/forward/validate";
const selection = (s: number, h = 0.5) => ({ enabled: true, s, h });
const mutation = (mu: number, nu: number) => ({ enabled: true, mu, nu });
const base = {
  populationSize: 100,
  initialAlleleCount: 100,
  generations: 20,
  seed: 321,
};
function moments(
  n: number,
  count: number,
  parameters = {},
  repetitions = 30_000,
) {
  const random = createRandom(3519);
  let sum = 0,
    squares = 0;
  for (let i = 0; i < repetitions; i++) {
    const p =
      evolutionWrightFisher.step(
        { generation: 0, alleleCount: count },
        { populationSize: n, ...parameters },
        random,
      ).alleleCount /
      (2 * n);
    sum += p;
    squares += p * p;
  }
  return {
    mean: sum / repetitions,
    variance: squares / repetitions - (sum / repetitions) ** 2,
  };
}
describe("selection → mutation → drift scientific acceptance", () => {
  it("matches N=100 neutral mean .5 and variance .00125", () => {
    const m = moments(100, 100);
    expect(Math.abs(m.mean - 0.5)).toBeLessThan(6 * Math.sqrt(0.00125 / 30000));
    expect(Math.abs(m.variance - 0.00125)).toBeLessThan(0.00125 * 0.04);
  });
  it("shows larger finite-horizon variance and more absorption in N=20 than N=1000", () => {
    function observe(n: number) {
      let sum = 0,
        squares = 0,
        absorbed = 0;
      for (let i = 0; i < 100; i++) {
        const r = runForward({
          populationSize: n,
          initialAlleleCount: n,
          generations: 80,
          seed: 3819 + i,
        });
        const p = r.trajectory[80].alleleCount / (2 * n);
        sum += p;
        squares += p * p;
        absorbed += Number(r.absorption !== null);
      }
      return { variance: squares / 100 - (sum / 100) ** 2, absorbed };
    }
    const small = observe(20),
      large = observe(1000);
    expect(small.variance).toBeGreaterThan(large.variance * 5);
    expect(small.absorbed).toBeGreaterThan(large.absorbed);
  });
  it.each([0.1, -0.1])(
    "matches selection-only one-generation mean and variance for s=%s",
    (s) => {
      const expected = applySelection(0.5, selection(s));
      const m = moments(100, 100, { selection: selection(s) });
      const variance = (expected * (1 - expected)) / 200;
      expect(Math.abs(m.mean - expected)).toBeLessThan(
        6 * Math.sqrt(variance / 30000),
      );
      expect(Math.abs(m.variance - variance)).toBeLessThan(variance * 0.04);
      expect(Math.sign(m.mean - 0.5)).toBe(Math.sign(s));
    },
  );
  it("uses normalized genotype contributions and dominance for rare A", () => {
    // p=.2, s=.5, h=.4: mean fitness .06 + .384 + .64 = 1.084.
    expect(applySelection(0.2, selection(0.5, 0.4))).toBeCloseTo(
      0.252 / 1.084,
      14,
    );
    expect(applySelection(0.1, selection(0.1, 1))).toBeGreaterThan(
      applySelection(0.1, selection(0.1, 0)),
    );
    expect(applySelection(0.1, selection(-0.1, 1))).toBeLessThan(
      applySelection(0.1, selection(-0.1, 0)),
    );
  });
  it("applies selection before mutation, with exactly one final binomial sample", () => {
    const parameters = {
      populationSize: 2,
      selection: selection(0.5),
      mutation: mutation(0.2, 0.1),
    };
    const probs = generationProbabilities(0.5, parameters);
    expect(probs.afterMutation).toBeCloseTo(
      probs.afterSelection * 0.8 + (1 - probs.afterSelection) * 0.1,
      14,
    );
    expect(probs.afterMutation).not.toBeCloseTo(
      applySelection(
        applyMutation(0.5, parameters.mutation),
        parameters.selection,
      ),
      8,
    );
    let calls = 0;
    evolutionWrightFisher.step(
      { generation: 0, alleleCount: 2 },
      parameters,
      () => {
        calls++;
        return 0.5;
      },
    );
    expect(calls).toBe(4);
  });
  it("matches the complete small-population selection+mutation transition distribution", () => {
    const parameters = {
      populationSize: 2,
      selection: selection(0.5),
      mutation: mutation(0.2, 0.1),
    };
    const p = generationProbabilities(0.5, parameters).afterMutation;
    const observed = [0, 0, 0, 0, 0],
      choose = [1, 4, 6, 4, 1],
      random = createRandom(1582);
    for (let i = 0; i < 50000; i++)
      observed[
        evolutionWrightFisher.step(
          { generation: 0, alleleCount: 2 },
          parameters,
          random,
        ).alleleCount
      ]++;
    choose.forEach((c, k) => {
      const q = c * p ** k * (1 - p) ** (4 - k);
      expect(Math.abs(observed[k] / 50000 - q)).toBeLessThan(
        6 * Math.sqrt((q * (1 - q)) / 50000),
      );
    });
  });
  it("has mutation-only restoring expectation, including oscillation at high rates", () => {
    const rates = mutation(0.06, 0.02),
      equilibrium = 0.25;
    expect(applyMutation(equilibrium, rates)).toBeCloseTo(equilibrium);
    expect(applyMutation(0.8, rates)).toBeLessThan(0.8);
    expect(applyMutation(0.1, rates)).toBeGreaterThan(0.1);
    const m = moments(100, 160, { mutation: rates });
    const p = applyMutation(0.8, rates);
    expect(Math.abs(m.mean - p)).toBeLessThan(
      6 * Math.sqrt((p * (1 - p)) / 200 / 30000),
    );
    expect(applyMutation(0.2, mutation(1, 1))).toBeCloseTo(0.8);
    expect(applyMutation(0.8, mutation(1, 1))).toBeCloseTo(0.2);
  });
  it("can leave both boundaries and classifies final state independently of first boundary", () => {
    for (const x of [0, 200]) {
      const r = runForward({
        ...base,
        initialAlleleCount: x,
        generations: 1,
        mutation: mutation(1, 1),
      });
      expect(r.trajectory[1].alleleCount).toBe(200 - x);
      expect(r.absorption).toBeNull();
      expect(r.firstBoundary?.generation).toBe(0);
      expect(r.finalStatus).toBe(x === 0 ? "fixed" : "lost");
    }
    const r = runForward({
      ...base,
      initialAlleleCount: 0,
      generations: 1,
      mutation: mutation(0, 0.5),
    });
    expect(r.finalStatus).toBe("segregating");
    expect(r.firstBoundary?.kind).toBe("lost");
    expect(r.absorption).toBeNull();
  });
  it("preserves the absorbing boundary for one-way mutation", () => {
    const r = runForward({
      ...base,
      initialAlleleCount: 0,
      mutation: mutation(0, 1),
    });
    expect(r.firstBoundary).toEqual({ kind: "lost", generation: 0 });
    expect(r.absorption).toEqual({ kind: "fixed", generation: 1 });
    expect(
      r.trajectory.slice(1).every((state) => state.alleleCount === 200),
    ).toBe(true);
  });
  it("is pathwise identical to v0.1 for disabled modules or zero coefficients", () => {
    let state = { generation: 0, alleleCount: 100 };
    const random = createRandom(base.seed),
      reference = [state];
    for (let i = 0; i < base.generations; i++) {
      state = neutralWrightFisher.step(state, base, random);
      reference.push(state);
    }
    for (const options of [
      {},
      {
        selection: { enabled: false, s: NaN, h: NaN },
        mutation: { enabled: false, mu: NaN, nu: NaN },
      },
      { selection: selection(0), mutation: mutation(0, 0) },
    ]) {
      expect(runForward({ ...base, ...options }).trajectory).toEqual(reference);
      const a = createRandom(base.seed),
        b = createRandom(base.seed);
      for (let i = 0; i < 20; i++)
        expect(
          evolutionWrightFisher.step(reference[0], { ...base, ...options }, a),
        ).toEqual(neutralWrightFisher.step(reference[0], base, b));
    }
  });
  it("rejects invalid active parameters but ignores disabled settings", () => {
    for (const options of [
      { selection: selection(-1) },
      { selection: selection(Infinity) },
      { selection: selection(0.1, 2) },
      { mutation: mutation(-0.1, 0) },
      { mutation: mutation(0, NaN) },
    ])
      expect(validateRun({ ...base, ...options }).length).toBeGreaterThan(0);
    expect(
      validateRun({ ...base, selection: { enabled: false, s: NaN, h: NaN } }),
    ).toEqual([]);
    expect(applySelection(0.5, selection(1e308))).toBeGreaterThan(0.5);
  });
  it("copies nested model settings into immutable results", () => {
    const options = selection(0.1);
    const r = runForward({ ...base, selection: options });
    options.s = -0.1;
    expect(r.parameters.selection?.s).toBe(0.1);
    expect(Object.isFrozen(r.parameters.selection)).toBe(true);
  });
});
