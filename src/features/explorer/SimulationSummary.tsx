import type { EnsembleResult } from "../../simulation/runEnsemble";
export function SimulationSummary({ result }: { result: EnsembleResult }) {
  const fixed = result.runs.filter((run) => run.finalStatus === "fixed").length;
  const lost = result.runs.filter((run) => run.finalStatus === "lost").length;
  const segregating = result.runs.length - fixed - lost;
  return (
    <div className="result-summary" aria-live="polite">
      <div>
        <span>固定 · Fixation</span>
        <strong className="summary-fixed">
          {fixed} / {result.runs.length}
        </strong>
        <small>第 {result.parameters.generations} 代 p = 1</small>
      </div>
      <div>
        <span>丢失 · Loss</span>
        <strong className="summary-lost">
          {lost} / {result.runs.length}
        </strong>
        <small>第 {result.parameters.generations} 代 p = 0</small>
      </div>
      <div>
        <span>多态 · Segregating</span>
        <strong className="summary-segregating">
          {segregating} / {result.runs.length}
        </strong>
        <small>
          第 {result.parameters.generations} 代仍满足 0 &lt; p &lt; 1
        </small>
      </div>
    </div>
  );
}
