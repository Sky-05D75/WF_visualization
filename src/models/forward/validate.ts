import type { NeutralRunParameters } from "./types";

// UI/runtime limits, not biological assumptions. Bound Bernoulli work on the main thread.
export const LIMITS = {
  populationSize: 2000,
  generations: 2000,
  draws: 2_000_000,
} as const;
export function validateRun(p: NeutralRunParameters): string[] {
  const errors: string[] = [];
  if (
    !Number.isInteger(p.populationSize) ||
    p.populationSize < 1 ||
    p.populationSize > LIMITS.populationSize
  )
    errors.push(`N 必须是 1–${LIMITS.populationSize} 的整数。`);
  if (
    !Number.isInteger(p.initialAlleleCount) ||
    p.initialAlleleCount < 0 ||
    p.initialAlleleCount > 2 * p.populationSize
  )
    errors.push("初始 A 拷贝数必须是 0 到 2N 之间的整数。");
  if (
    !Number.isInteger(p.generations) ||
    p.generations < 1 ||
    p.generations > LIMITS.generations
  )
    errors.push(`T 必须是 1–${LIMITS.generations} 的整数。`);
  if (2 * p.populationSize * p.generations > LIMITS.draws)
    errors.push("请减小 N 或 T，使 2N × T ≤ 2,000,000，保持交互流畅。");
  if (!Number.isInteger(p.seed) || p.seed < 0 || p.seed > 0xffffffff)
    errors.push("随机种子必须是 0–4294967295 的整数。");
  return errors;
}
