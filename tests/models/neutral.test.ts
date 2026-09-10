import { describe, expect, it } from "vitest";
import { sampleBinomial } from "../../src/models/shared/binomial";
import { createRandom } from "../../src/models/shared/random";
import { neutralWrightFisher } from "../../src/models/forward/neutralWrightFisher";

const step = (x: number, n: number, seed = 42) =>
  neutralWrightFisher.step(
    { generation: 0, alleleCount: x },
    { populationSize: n },
    createRandom(seed),
  );
describe("neutral Wright–Fisher transition", () => {
  it("keeps absorbing states exact", () => {
    expect(step(0, 20).alleleCount).toBe(0);
    expect(step(40, 20).alleleCount).toBe(40);
  });
  it("rejects fractional copies, invalid populations and generations", () => {
    expect(() => step(1.5, 20)).toThrow();
    expect(() => step(41, 20)).toThrow();
    expect(() => step(1, 1.5)).toThrow();
    expect(() =>
      neutralWrightFisher.step(
        { generation: -1, alleleCount: 1 },
        { populationSize: 2 },
        createRandom(0),
      ),
    ).toThrow();
  });
  it("matches the full small-population Binomial(4, 1/4) transition distribution", () => {
    const random = createRandom(371);
    const counts = [0, 0, 0, 0, 0];
    const repetitions = 100_000;
    for (let i = 0; i < repetitions; i++)
      counts[
        neutralWrightFisher.step(
          { generation: 0, alleleCount: 1 },
          { populationSize: 2 },
          random,
        ).alleleCount
      ]++;
    const probabilities = [81, 108, 54, 12, 1].map((value) => value / 256);
    probabilities.forEach((q, k) => {
      // Six binomial standard errors, fixed seed: not a fragile exact-sample assertion.
      expect(Math.abs(counts[k] / repetitions - q)).toBeLessThan(
        6 * Math.sqrt((q * (1 - q)) / repetitions),
      );
    });
  });
  it.each([5, 50])(
    "has the correct one-generation mean and variance for N=%i",
    (n) => {
      const random = createRandom(805);
      const p = 0.3;
      const repetitions = 60_000;
      let sum = 0;
      let squares = 0;
      for (let i = 0; i < repetitions; i++) {
        const next = neutralWrightFisher.step(
          { generation: 0, alleleCount: p * 2 * n },
          { populationSize: n },
          random,
        );
        const frequency = next.alleleCount / (2 * n);
        expect(Number.isInteger(next.alleleCount)).toBe(true);
        sum += frequency;
        squares += (frequency - p) ** 2;
      }
      const variance = (p * (1 - p)) / (2 * n);
      expect(Math.abs(sum / repetitions - p)).toBeLessThan(
        6 * Math.sqrt(variance / repetitions),
      );
      expect(Math.abs(squares / repetitions - variance)).toBeLessThan(
        variance * 0.04,
      );
    },
  );
});
describe("random sampling contracts", () => {
  it("reproduces seeds and respects [0, 1)", () => {
    const a = createRandom(0),
      b = createRandom(0);
    for (let i = 0; i < 1000; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(() => createRandom(-1)).toThrow();
    expect(() => createRandom(2 ** 32)).toThrow();
  });
  it("rejects invalid distributions and random sources", () => {
    expect(() => sampleBinomial(2.5, 0.5, () => 0.2)).toThrow();
    expect(() => sampleBinomial(2, NaN, () => 0.2)).toThrow();
    expect(() => sampleBinomial(2, 0.5, () => 1)).toThrow();
  });
});
