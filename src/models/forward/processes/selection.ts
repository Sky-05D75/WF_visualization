import type { SelectionParameters } from "../types";

export function selectionErrors(selection?: SelectionParameters): string[] {
  if (!selection?.enabled) return [];
  const errors: string[] = [];
  if (!Number.isFinite(selection.s) || selection.s <= -1)
    errors.push("选择系数 s 必须是大于 −1 的有限数（确保适合度为正）。");
  if (!Number.isFinite(selection.h) || selection.h < 0 || selection.h > 1)
    errors.push("显性系数 h 必须位于 0–1 之间。");
  return errors;
}
/** Hardy–Weinberg proportions are expected pre-selection frequencies, not extra sampled individuals. */
export function applySelection(
  p: number,
  selection?: SelectionParameters,
): number {
  if (!Number.isFinite(p) || p < 0 || p > 1)
    throw new RangeError("频率必须位于 [0, 1]。");
  const errors = selectionErrors(selection);
  if (errors.length) throw new RangeError(errors.join(" "));
  if (!selection?.enabled || selection.s === 0 || p === 0 || p === 1) return p;
  const { s, h } = selection;
  // Scaling all fitnesses equally preserves the ratio and prevents overflow for large s.
  const scale = Math.max(1, 1 + s);
  const aa = (1 - p) ** 2 / scale;
  const AA = p * p * ((1 + s) / scale);
  const Aa = 2 * p * (1 - p) * ((1 + h * s) / scale);
  const mean = AA + Aa + aa;
  if (!(mean > 0) || !Number.isFinite(mean))
    throw new RangeError("平均适合度必须为有限正数。");
  return (AA + Aa / 2) / mean;
}
