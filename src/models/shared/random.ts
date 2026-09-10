/** A uniform pseudo-random source returning values in [0, 1). */
export type RandomSource = () => number;
export const RANDOM_ALGORITHM = "mulberry32-v1";

/** Stable 32-bit seed; suitable for teaching simulations, not cryptography. */
export function createRandom(seed: number): RandomSource {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError("随机种子必须是 0 到 4294967295 之间的整数。");
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
