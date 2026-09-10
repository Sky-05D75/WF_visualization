import { useEffect, useRef, useState } from "react";
import {
  runEnsemble,
  validateEnsemble,
  type EnsembleParameters,
  type EnsembleResult,
} from "../../simulation/runEnsemble";

export type Draft = Record<Exclude<keyof EnsembleParameters, "seed">, string>;
const initialDraft: Draft = {
  populationSize: "100",
  initialAlleleCount: "100",
  generations: "200",
  replicates: "20",
};
export function parseDraft(draft: Draft): EnsembleParameters {
  const number = (value: string) => (value.trim() === "" ? NaN : Number(value));
  return {
    populationSize: number(draft.populationSize),
    initialAlleleCount: number(draft.initialAlleleCount),
    generations: number(draft.generations),
    replicates: number(draft.replicates),
    seed: 0,
  };
}
export function useExperiment() {
  const [draft, setDraft] = useState<Draft>({ ...initialDraft });
  const [result, setResult] = useState<EnsembleResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const parameters = parseDraft(draft);
  const errors = validateEnsemble(parameters);
  function cancel() {
    active.current?.abort();
    active.current = null;
    setBusy(false);
    setCompleted(0);
    setFailure(null);
  }
  function update(key: keyof Draft, value: string) {
    cancel();
    setDraft((previous) => ({ ...previous, [key]: value }));
    setResult(null);
  }
  async function run() {
    if (errors.length || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setCompleted(0);
    setFailure(null);
    setResult(null);
    try {
      const seed = crypto.getRandomValues(new Uint32Array(1))[0];
      const next = await runEnsemble(
        { ...parameters, seed },
        controller.signal,
        setCompleted,
      );
      if (active.current === controller) setResult(next);
    } catch (error) {
      if (!controller.signal.aborted)
        setFailure(
          error instanceof Error ? error.message : "模拟运行失败，请重试。",
        );
    } finally {
      if (active.current === controller) {
        active.current = null;
        setBusy(false);
      }
    }
  }
  function reset() {
    cancel();
    setDraft({ ...initialDraft });
    setResult(null);
  }
  useEffect(
    () => () => {
      active.current?.abort();
    },
    [],
  );
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.code !== "Space" ||
        event.repeat ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey ||
        event.defaultPrevented
      )
        return;
      const target = event.target;
      // Preserve native editing, buttons, range sliders and disclosure keyboard behavior.
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            'input, textarea, select, button, summary, a, [role="button"], [role="slider"]',
          ))
      )
        return;
      event.preventDefault();
      void run();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  return {
    draft,
    parameters,
    result,
    errors,
    update,
    run,
    reset,
    busy,
    completed,
    failure,
  };
}
