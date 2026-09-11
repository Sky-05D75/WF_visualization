import type { useExperiment } from "./useExperiment";
import { TheoryDisclosure } from "../../theory/TheoryDisclosure";
export function EvolutionControls({
  experiment: e,
}: {
  experiment: ReturnType<typeof useExperiment>;
}) {
  const { selectionEnabled, mutationEnabled } = e.draft;
  const { selection } = e.parameters;
  return (
    <>
      <section className="process-control field">
        <label className="process-switch" htmlFor="selection-enabled">
          <span>自然选择 · Selection</span>
          <input
            id="selection-enabled"
            type="checkbox"
            role="switch"
            checked={selectionEnabled}
            onChange={(event) =>
              e.update("selectionEnabled", event.target.checked)
            }
          />
        </label>
        {selectionEnabled && (
          <fieldset className="process-parameters">
            <legend>选择参数</legend>
            <label htmlFor="selection-s">选择系数 s</label>
            <input
              id="selection-s"
              type="number"
              step="any"
              required
              value={e.draft.s}
              onChange={(event) => e.update("s", event.target.value)}
            />
            <p className="field-hint">
              s &gt; −1；s &gt; 0 有利于 A，s &lt; 0 不利于 A。
            </p>
            <label htmlFor="selection-h">显性系数 h</label>
            <input
              id="selection-h"
              type="number"
              min="0"
              max="1"
              step="any"
              required
              value={e.draft.h}
              onChange={(event) => e.update("h", event.target.value)}
            />
            <p className="field-hint">
              h = 0：隐性；h = 0.5：加性；h = 1：显性。
            </p>
            {selection &&
              Number.isFinite(selection.s) &&
              Number.isFinite(selection.h) && (
                <p className="fitness-readout">
                  wAA = {(1 + selection.s).toPrecision(4)}
                  <br />
                  wAa = {(1 + selection.h * selection.s).toPrecision(4)}
                  <br />
                  waa = 1
                </p>
              )}
          </fieldset>
        )}
        <TheoryDisclosure theoryId="selection" />
      </section>
      <section className="process-control field">
        <label className="process-switch" htmlFor="mutation-enabled">
          <span>突变 · Mutation</span>
          <input
            id="mutation-enabled"
            type="checkbox"
            role="switch"
            checked={mutationEnabled}
            onChange={(event) =>
              e.update("mutationEnabled", event.target.checked)
            }
          />
        </label>
        {mutationEnabled && (
          <fieldset className="process-parameters">
            <legend>双向突变参数</legend>
            <label htmlFor="mutation-mu">突变率 μ（A → a）</label>
            <input
              id="mutation-mu"
              type="number"
              min="0"
              max="1"
              step="any"
              required
              value={e.draft.mu}
              onChange={(event) => e.update("mu", event.target.value)}
            />
            <label htmlFor="mutation-nu">突变率 ν（a → A）</label>
            <input
              id="mutation-nu"
              type="number"
              min="0"
              max="1"
              step="any"
              required
              value={e.draft.nu}
              onChange={(event) => e.update("nu", event.target.value)}
            />
            <p className="field-hint">
              每代、每个拷贝的转换概率；支持科学计数法。
            </p>
          </fieldset>
        )}
        <TheoryDisclosure theoryId="mutation" />
      </section>
    </>
  );
}
