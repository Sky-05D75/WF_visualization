import type { MutationParameters } from "../types";
export function mutationErrors(mutation?: MutationParameters): string[] {
  if (!mutation?.enabled) return [];
  const errors: string[] = [];
  if (!Number.isFinite(mutation.mu) || mutation.mu < 0 || mutation.mu > 1)
    errors.push("突变率 μ（A → a）必须位于 0–1 之间。");
  if (!Number.isFinite(mutation.nu) || mutation.nu < 0 || mutation.nu > 1)
    errors.push("突变率 ν（a → A）必须位于 0–1 之间。");
  return errors;
}
export function applyMutation(
  p: number,
  mutation?: MutationParameters,
): number {
  if (!Number.isFinite(p) || p < 0 || p > 1)
    throw new RangeError("频率必须位于 [0, 1]。");
  const errors = mutationErrors(mutation);
  if (errors.length) throw new RangeError(errors.join(" "));
  if (!mutation?.enabled || (mutation.mu === 0 && mutation.nu === 0)) return p;
  return p * (1 - mutation.mu) + (1 - p) * mutation.nu;
}
