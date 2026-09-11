import { EvolutionControls } from "./EvolutionControls";
import type { FormEvent } from "react";
import { LIMITS } from "../../models/forward/validate";
import { TheoryDisclosure } from "../../theory/TheoryDisclosure";
import type { useExperiment } from "./useExperiment";

export function ParameterControls({
  experiment: e,
}: {
  experiment: ReturnType<typeof useExperiment>;
}) {
  const { populationSize: n, initialAlleleCount: x } = e.parameters;
  const validN = Number.isInteger(n) && n >= 1 && n <= LIMITS.populationSize;
  const validX = validN && Number.isInteger(x) && x >= 0 && x <= 2 * n;
  function submit(event: FormEvent) {
    event.preventDefault();
    e.run();
  }
  return (
    <form className="controls panel" onSubmit={submit}>
      <div className="section-heading">
        <span className="eyebrow">01 / PARAMETERS</span>
        <h2>模拟参数</h2>
        <p>设定种群大小、初始状态与独立重复次数。</p>
      </div>
      <div className="field">
        <label htmlFor="population">
          种群大小 <i>N</i>
          <span>二倍体个体数</span>
        </label>
        <input
          id="population"
          type="number"
          min="1"
          max={LIMITS.populationSize}
          step="1"
          required
          value={e.draft.populationSize}
          onChange={(event) => e.update("populationSize", event.target.value)}
        />
        <div className="field-hint">
          {validN
            ? `${(2 * n).toLocaleString()} 个等位基因拷贝 · 每代恒定`
            : "请输入有效的整数种群大小"}
        </div>
        <TheoryDisclosure theoryId="population" />
      </div>
      <div className="field">
        <label htmlFor="copies">
          初始 A 拷贝数 <i>X₀</i>
        </label>
        <input
          id="copies"
          type="number"
          min="0"
          max={validN ? 2 * n : undefined}
          step="1"
          required
          value={e.draft.initialAlleleCount}
          onChange={(event) =>
            e.update("initialAlleleCount", event.target.value)
          }
        />
        <label className="range-label" htmlFor="frequency">
          初始频率 p₀ <strong>{validX ? (x / (2 * n)).toFixed(4) : "—"}</strong>
        </label>
        <input
          id="frequency"
          type="range"
          min="0"
          max={validN ? 2 * n : 2}
          step="1"
          disabled={!validN}
          value={validX ? x : 0}
          onChange={(event) =>
            e.update("initialAlleleCount", event.target.value)
          }
          aria-valuetext={validX ? `${x} / ${2 * n}` : "请重新选择初始拷贝数"}
        />
        <div className="range-ends">
          <span>0 · 丢失</span>
          <span>1 · 固定</span>
        </div>
        <div className="field-hint">
          {validX
            ? `p₀ = ${x} / ${2 * n}；每步 1 / ${2 * n}`
            : "X₀ 必须位于 0 到 2N 之间"}
          <br />
          改变 N 时保留 X₀，频率随之重新计算。
        </div>
        <TheoryDisclosure theoryId="initial" />
      </div>
      <div className="field">
        <label htmlFor="generations">
          模拟代数 <i>T</i>
        </label>
        <input
          id="generations"
          type="number"
          min="1"
          max={LIMITS.generations}
          step="1"
          required
          value={e.draft.generations}
          onChange={(event) => e.update("generations", event.target.value)}
        />
        <TheoryDisclosure theoryId="generations" />
      </div>
      <div className="field">
        <label htmlFor="replicates">
          轨迹数 <i>R</i>
        </label>
        <input
          id="replicates"
          type="number"
          min="1"
          max="100"
          step="1"
          required
          value={e.draft.replicates}
          onChange={(event) => e.update("replicates", event.target.value)}
        />
        <input
          aria-label="调节轨迹数"
          type="range"
          min="1"
          max="100"
          step="1"
          value={
            Number.isInteger(e.parameters.replicates) &&
            e.parameters.replicates >= 1 &&
            e.parameters.replicates <= 100
              ? e.parameters.replicates
              : 1
          }
          onChange={(event) => e.update("replicates", event.target.value)}
        />
        <div className="range-ends">
          <span>1</span>
          <span>100</span>
        </div>
        <TheoryDisclosure theoryId="replicates" />
      </div>
      <EvolutionControls experiment={e} />
      {e.failure && <p role="alert">{e.failure}</p>}
      {e.errors.length > 0 && (
        <div className="errors" role="alert">
          {e.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      <button
        className="primary-button"
        type="submit"
        disabled={e.errors.length > 0 || e.busy}
      >
        {e.busy
          ? `模拟中 ${e.completed} / ${e.parameters.replicates}`
          : "运行模拟"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <button className="reset-button" type="button" onClick={e.reset}>
        重置实验
      </button>
      <p className="control-note">
        每次运行自动随机初始化。页面非输入区域按一次空格可运行；长按不重复触发。
      </p>
    </form>
  );
}
