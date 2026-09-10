import type { TheoryContent } from "./types";
export const neutralContent = {
  population: {
    title: "种群大小 N",
    biology: [
      "N 是二倍体个体数。对一个位点，每个个体有两个等位基因拷贝，所以基因池共有 2N 个拷贝。",
      "本实验每代 N 恒定，世代不重叠。下一代独立、有放回地从上一代基因池抽样。",
    ],
    mathematics: [
      {
        text: "N 为正整数；Xₜ 是第 t 代 A 的整数拷贝数。",
        formula: String.raw`X_t\in\{0,1,\ldots,2N\},\quad p_t=\frac{X_t}{2N}`,
      },
      {
        text: "在相同当前频率下，N 越小，一代频率变化的条件方差越大。",
        formula: String.raw`\operatorname{Var}(p_{t+1}\mid p_t)=\frac{p_t(1-p_t)}{2N}`,
      },
    ],
  },
  initial: {
    title: "初始频率 p₀",
    biology: [
      "我们追踪单个位点的两个等位基因 A 与 a。频率是 A 拷贝数占总拷贝数的比例，不是携带 A 的个体比例。",
      "频率只能按一个拷贝变化。改变 N 时保留输入的 X₀，并明确显示新的频率；若 X₀ 超出 2N，请重新选择。",
    ],
    mathematics: [
      {
        text: "初始状态必须位于有限种群允许的离散网格上。",
        formula: String.raw`p_0=\frac{X_0}{2N}\in\left\{0,\frac{1}{2N},\ldots,1\right\}`,
      },
    ],
  },
  generations: {
    title: "模拟代数 T",
    biology: [
      "一次更新代表完整的一代替换。第 0 代是初始种群，T 是本次实验向前推进的代数。",
      "到达 T 时仍未固定或丢失，只意味着本次观察窗口内没有吸收。",
    ],
    mathematics: [
      {
        text: "轨迹包含 T + 1 个状态。T 不改变每一代的转移规则。",
        formula: String.raw`t=0,1,\ldots,T`,
      },
    ],
  },
  replicates: {
    title: "独立重复次数 R",
    biology: [
      "各条轨迹具有相同的 N、X₀ 和 T，分别进行随机抽样。R 为模拟重复次数，不是种群大小。每次运行自动生成随机种子，各重复使用不同的伪随机流。",
      "轨迹按观察窗口内的吸收状态分类。尚未吸收表示截至 T 仍有两个等位基因共存，不表示以后不会固定或丢失。",
    ],
    mathematics: [
      {
        text: "每个重复均遵循相同的一代条件分布。",
        formula: String.raw`X_{t+1}^{(r)}\mid p_t^{(r)}\sim\operatorname{Binomial}(2N,p_t^{(r)}),\quad r=1,\ldots,R`,
      },
      {
        text: "固定、丢失与未吸收的计数之和等于 R；有限 T 下的固定比例不是最终固定概率。",
      },
    ],
  },
  model: {
    title: "中性 Wright–Fisher 模型",
    biology: [
      "假设：有限二倍体种群、单个位点、两个等位基因、恒定 N、非重叠世代、独立有放回抽样。不包含选择、突变、迁移与重组。",
      "遗传漂变来自有限抽样。中性意味着没有方向性偏移，不意味着某一条轨迹不变化。",
      "A 频率为 0 时丢失，为 1 时固定。本模型中没有重新引入等位基因的机制，因此二者均为吸收态。",
    ],
    mathematics: [
      {
        text: "下一代 A 的拷贝数服从二项分布。",
        formula: String.raw`X_{t+1}\mid p_t\sim\operatorname{Binomial}(2N,p_t)`,
      },
      {
        text: "由二项分布的期望 E[X] = np，频率的条件期望等于当前频率。",
        formula: String.raw`\mathbb{E}[p_{t+1}\mid p_t]=\frac{2Np_t}{2N}=p_t`,
      },
      {
        text: "由 Var(X) = np(1−p)，除以总拷贝数的平方，得到一代条件方差。它不是第 t 代的跨轨迹方差。",
        formula: String.raw`\operatorname{Var}(p_{t+1}\mid p_t)=\frac{2Np_t(1-p_t)}{(2N)^2}=\frac{p_t(1-p_t)}{2N}`,
      },
      {
        text: "在这两个边界，下一代仍保持相同频率。",
        formula: String.raw`p_t\in\{0,1\}\ \Longrightarrow\ p_{t+1}=p_t`,
      },
    ],
  },
} satisfies Record<string, TheoryContent>;
export type TheoryId = keyof typeof neutralContent;
