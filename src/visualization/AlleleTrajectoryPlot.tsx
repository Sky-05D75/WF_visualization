import { generationProbabilities } from "../models/forward/evolutionWrightFisher";
import { useMemo, useState } from "react";
import type { EnsembleResult } from "../simulation/runEnsemble";
import { trajectoryData } from "./trajectoryData";

const box = {
  width: 840,
  height: 380,
  left: 62,
  right: 28,
  top: 32,
  bottom: 52,
};
const statusLabels = { fixed: "固定", lost: "丢失", segregating: "多态" };
export function AlleleTrajectoryPlot({ result }: { result: EnsembleResult }) {
  const [selected, setSelected] = useState(0);
  const [highlighted, setHighlighted] = useState(0);
  const width = box.width - box.left - box.right;
  const height = box.height - box.top - box.bottom;
  const sx = (generation: number) =>
    box.left + (generation / result.parameters.generations) * width;
  const sy = (p: number) => box.top + (1 - p) * height;
  // Paths depend on results, not pointer position: do not rebuild 100 paths on every hover.
  const paths = useMemo(
    () =>
      result.runs.map((run, index) => {
        const data = trajectoryData(run);
        return {
          index,
          data,
          status: run.finalStatus,
          path: data
            .map(
              (d, i) =>
                `${i === 0 ? "M" : "L"}${(box.left + (d.generation / result.parameters.generations) * width).toFixed(2)},${(box.top + (1 - d.frequency) * height).toFixed(2)}`,
            )
            .join(" "),
        };
      }),
    [result, width, height],
  );
  const selectedIndex = Math.min(highlighted, paths.length - 1);
  const focus = paths[selectedIndex];
  const t = Math.min(selected, result.parameters.generations);
  const point = focus.data[t];
  const run = result.runs[selectedIndex];
  const probabilities = generationProbabilities(
    point.frequency,
    result.parameters,
  );
  const xticks = Array.from(
    new Set(
      Array.from({ length: 6 }, (_, i) =>
        Math.round((i * result.parameters.generations) / 5),
      ),
    ),
  );
  return (
    <div className="trajectory">
      <div className="plot-legend">
        <span>
          <b className="legend-line lost" />
          丢失（Loss）
        </span>
        <span>
          <b className="legend-line fixed" />
          固定（Fixation）
        </span>
        <span>
          <b className="legend-line segregating" />
          多态
        </span>
        <span>
          <b className="legend-dash" />
          初始频率
        </span>
      </div>
      <svg
        viewBox={`0 0 ${box.width} ${box.height}`}
        role="img"
        aria-labelledby="trajectory-title"
        aria-describedby="trajectory-description"
        onPointerMove={(event) => {
          const matrix = event.currentTarget.getScreenCTM();
          if (!matrix) return;
          const local = new DOMPoint(
            event.clientX,
            event.clientY,
          ).matrixTransform(matrix.inverse());
          setSelected(
            Math.max(
              0,
              Math.min(
                result.parameters.generations,
                Math.round(
                  ((local.x - box.left) / width) *
                    result.parameters.generations,
                ),
              ),
            ),
          );
        }}
      >
        <title id="trajectory-title">A 的等位基因频率轨迹</title>
        <desc id="trajectory-description">
          {result.runs.length}{" "}
          条独立轨迹。红色表示丢失，绿色表示固定，灰色表示末代多态。第{" "}
          {selectedIndex + 1} 条轨迹加粗加深。横轴为世代，纵轴为频率。
        </desc>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line
              className="gridline"
              x1={box.left}
              x2={box.width - box.right}
              y1={sy(p)}
              y2={sy(p)}
            />
            <text x={box.left - 14} y={sy(p) + 4} textAnchor="end">
              {p.toFixed(2)}
            </text>
          </g>
        ))}
        {xticks.map((g) => (
          <text key={g} x={sx(g)} y={box.height - 28} textAnchor="middle">
            {g}
          </text>
        ))}
        <text x={box.left} y="17">
          频率 pₜ
        </text>
        <text x={box.width - box.right} y={box.height - 5} textAnchor="end">
          世代 t
        </text>
        <line
          className="initial-line"
          x1={box.left}
          x2={box.width - box.right}
          y1={sy(focus.data[0].frequency)}
          y2={sy(focus.data[0].frequency)}
        />
        {paths
          .filter((item) => item.index !== selectedIndex)
          .map((item) => (
            <path
              key={item.index}
              className={`frequency-line ${item.status}`}
              d={item.path}
            >
              <title>
                轨迹 {item.index + 1}：{statusLabels[item.status]}
              </title>
            </path>
          ))}
        <path
          className={`frequency-line ${focus.status} highlighted`}
          d={focus.path}
        >
          <title>
            轨迹 {selectedIndex + 1}：{statusLabels[focus.status]}（选定）
          </title>
        </path>
        <line
          className="cursor-line"
          x1={sx(t)}
          x2={sx(t)}
          y1={box.top}
          y2={sy(0)}
        />
        <circle
          className={`cursor-dot ${focus.status}`}
          cx={sx(t)}
          cy={sy(point.frequency)}
          r="5"
        />
      </svg>
      <div className="trajectory-selection">
        <label htmlFor="highlight-trajectory">突出显示轨迹</label>
        <select
          id="highlight-trajectory"
          value={selectedIndex}
          onChange={(event) => setHighlighted(Number(event.target.value))}
        >
          {paths.map((item) => (
            <option key={item.index} value={item.index}>
              轨迹 {item.index + 1} · {statusLabels[item.status]}
            </option>
          ))}
        </select>
        <span>
          {run.absorption
            ? `永久吸收：第 ${run.absorption.generation} 代（${statusLabels[run.absorption.kind]}）`
            : run.firstBoundary
              ? `首次到达${statusLabels[run.firstBoundary.kind]}边界：第 ${run.firstBoundary.generation} 代（非吸收）`
              : "观察窗口内未到达边界"}
        </span>
      </div>
      <div className="inspection">
        <label htmlFor="inspect-generation">
          逐代观察 <strong>第 {t} 代</strong>
        </label>
        <output htmlFor="inspect-generation">
          Xₜ = {point.alleleCount} / {2 * result.parameters.populationSize}{" "}
          <span>pₜ = {point.frequency.toFixed(4)}</span>
        </output>
      </div>
      {(result.parameters.selection?.enabled ||
        result.parameters.mutation?.enabled) && (
        <div className="transition-readout">
          <strong>
            第 {t} 代的单代转移概率
            {t === result.parameters.generations ? "（下一代未模拟）" : ""}
          </strong>
          <span>
            pₜ = {point.frequency.toFixed(6)} → pₛ ={" "}
            {probabilities.afterSelection.toFixed(6)} → pₛₘ ={" "}
            {probabilities.afterMutation.toFixed(6)}
          </span>
          <span>
            E[pₜ₊₁ | pₜ] = {probabilities.afterMutation.toFixed(6)}；Var ={" "}
            {(
              (probabilities.afterMutation *
                (1 - probabilities.afterMutation)) /
              (2 * result.parameters.populationSize)
            ).toExponential(3)}
          </span>
        </div>
      )}
      <input
        id="inspect-generation"
        aria-label="观察世代"
        type="range"
        min="0"
        max={result.parameters.generations}
        value={t}
        onChange={(event) => setSelected(Number(event.target.value))}
      />
    </div>
  );
}
