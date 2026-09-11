import { useExperiment } from "./useExperiment";
import { ParameterControls } from "./ParameterControls";
import { SimulationSummary } from "./SimulationSummary";
import { AlleleTrajectoryPlot } from "../../visualization/AlleleTrajectoryPlot";
import { TheoryDisclosure } from "../../theory/TheoryDisclosure";

export function Explorer() {
  const experiment = useExperiment();
  return (
    <div className="workspace">
      <ParameterControls experiment={experiment} />
      <section className="observation">
        <div className="panel plot-panel">
          <div className="plot-heading">
            <div>
              <span className="eyebrow">02 / ALLELE FREQUENCY</span>
              <h2>等位基因频率轨迹</h2>
            </div>
            <span className="live-tag">独立重复模拟</span>
          </div>
          {experiment.result ? (
            <>
              <AlleleTrajectoryPlot result={experiment.result} />
              <SimulationSummary result={experiment.result} />
            </>
          ) : (
            <div className="empty-plot">
              <span className="empty-symbol" aria-hidden="true">
                ↝
              </span>
              <h3>
                {experiment.busy
                  ? `模拟进度：${experiment.completed} / ${experiment.parameters.replicates}`
                  : "Wright–Fisher 正向模拟"}
              </h3>
              <p>
                设定参数后，单击“运行模拟”或按空格开始。
                <br />
                改变参数后，运行以开始新的实验。
              </p>
              <span className="empty-axis">0 ≤ pₜ ≤ 1 · 离散世代</span>
            </div>
          )}
          <p className="plot-note">
            颜色依据第 T 代的状态：A
            丢失为红色、固定为绿色、多态为灰色。突变可使轨迹离开边界；首次到达不等于永久吸收。加粗轨迹不是平均值。
          </p>
        </div>
        <div className="learning-note">
          <span className="note-number">?</span>
          <div>
            <h3>种群大小与遗传漂变强度</h3>
            <p>
              保持相同初始频率，分别观察较小和较大的
              N；通过多条独立轨迹比较一代频率波动。
            </p>
          </div>
        </div>
        <div className="panel model-panel">
          <span className="eyebrow">03 / THEORY</span>
          <h2>模型假设与数学原理</h2>
          <p>漂变来自随机繁殖中的有限抽样。展开查看模型假设与数学推导。</p>
          <div className="lifecycle-strip" aria-label="当前生命周期">
            <span>随机交配</span>
            <b>→</b>
            <span>
              {experiment.parameters.selection?.enabled
                ? "自然选择"
                : "选择关闭"}
            </span>
            <b>→</b>
            <span>
              {experiment.parameters.mutation?.enabled
                ? "双向突变"
                : "突变关闭"}
            </span>
            <b>→</b>
            <span>遗传漂变</span>
          </div>
          <TheoryDisclosure
            theoryId={
              experiment.parameters.selection?.enabled ||
              experiment.parameters.mutation?.enabled
                ? "lifecycle"
                : "model"
            }
          />
        </div>
      </section>
    </div>
  );
}
