import type { RandomSource } from "./random";

/** Sum of independent Bernoulli draws; no normal/diffusion approximation. */
export function sampleBinomial(
  n: number,
  p: number,
  random: RandomSource,
): number {
  if (
    !Number.isSafeInteger(n) ||
    n < 0 ||
    !Number.isFinite(p) ||
    p < 0 ||
    p > 1
  ) {
    throw new RangeError("二项分布要求非负整数 n 和 0 ≤ p ≤ 1。");
  }
  if (p === 0) return 0;
  if (p === 1) return n;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const u = random();
    if (!Number.isFinite(u) || u < 0 || u >= 1)
      throw new RangeError("随机源必须返回 [0, 1) 内的数。");
    if (u < p) count++;
  }
  return count;
}
