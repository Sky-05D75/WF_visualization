import type { TheoryContent } from "./types";
export const evolutionContent = {
  selection: {
    title: "自然选择与显性系数",
    biology: [
      "选择作用于 AA、Aa、aa 基因型的相对繁殖贡献。随机交配后的期望基因型频率为 p²、2p(1−p)、(1−p)²；此处不另行抽样 N 个个体。",
      "Hardy–Weinberg 比例仅用于选择之前，选择后贡献需按平均适合度归一化，通常不再满足该比例。",
      "s 是选择系数，h 决定杂合子的适合度效应。h=0 时 A 的效应为隐性，h=1 时为显性，h=0.5 时适合度效应为加性。s=0 时 h 不产生作用。",
      "本版使用 s>−1、0≤h≤1，保证所有基因型适合度为正；不包含超显性、欠显性或零平均适合度的情况。有限抽样仍可能使有利等位基因暂时下降或丢失。",
    ],
    mathematics: [
      {
        text: "令 q=1−p。相对适合度为：",
        formula: String.raw`w_{AA}=1+s,\quad w_{Aa}=1+hs,\quad w_{aa}=1`,
      },
      {
        text: "对选择前的基因型频率进行适合度加权，得到平均适合度。",
        formula: String.raw`\bar w=p^2(1+s)+2pq(1+hs)+q^2`,
      },
      {
        text: "AA 中全部拷贝是 A，Aa 中一半是 A。因此 A 的频率为加权基因型贡献的比例。",
        formula: String.raw`p_s=\frac{p^2(1+s)+\tfrac12\,2pq(1+hs)}{\bar w}`,
      },
      {
        text: "关闭选择或设置 s=0 时，频率保持不变。",
        formula: String.raw`s=0\ \Longrightarrow\ p_s=p`,
      },
    ],
  },
  mutation: {
    title: "双向突变",
    biology: [
      "μ 表示每代 A→a 的概率，ν 表示 a→A 的概率。突变在选择之后、有限抽样之前作用于拷贝的身份。两个方向分别作用于不同类型的拷贝，所以 μ+ν 不要求小于等于 1。",
      "突变转换给出下一代抽样概率，不另外执行一轮随机突变计数，避免重复加入随机性。",
      "ν>0 时 p=0 可被离开；μ>0 时 p=1 可被离开。非零概率并不保证下一代一定离开边界。单向突变仅解除其中一个边界的吸收性。",
    ],
    mathematics: [
      {
        text: "A 保留贡献为 pₛ(1−μ)，a 转变为 A 的贡献为 (1−pₛ)ν。",
        formula: String.raw`p_{sm}=p_s(1-\mu)+(1-p_s)\nu`,
      },
      {
        text: "仅考虑突变（关闭选择），μ+ν>0 时的确定性平衡为：",
        formula: String.raw`p^*=\frac{\nu}{\mu+\nu},\quad p_{t+1}^{\rm det}-p^*=(1-\mu-\nu)(p_t-p^*)`,
      },
      {
        text: "当 0<μ+ν<2 时，确定性轨迹趋向平衡；μ+ν>1 时交替接近。μ=ν=1 时发生翻转而非收敛。有限种群仍有漂变，单条轨迹不会固定停在 p*。开启选择后，此突变单独平衡公式通常不再适用。",
      },
    ],
  },
  lifecycle: {
    title: "选择–突变–漂变生命周期",
    biology: [
      "每一代严格依次执行随机交配、选择、突变和遗传漂变。种群大小恒定，世代不重叠，单个位点、两个等位基因；不含迁移与重组。",
      "随机交配给出选择前的期望基因型组成；选择和突变转换抽样概率，最终只用一次二项抽样产生整数拷贝数。",
      "关闭模块时跳过对应转换；关闭两者或将 s、μ、ν 全部设为 0 时，回归 v0.1 中性模型。",
      "图中红、绿、灰分别表示末代 A 丢失、固定与多态。存在相应反向突变时，固定或丢失只描述该代状态，不代表永久吸收。",
    ],
    mathematics: [
      {
        text: "第 t 代频率来自整数拷贝数。选择前期望基因型组成为：",
        formula: String.raw`p_t=\frac{X_t}{2N},\quad (f_{AA},f_{Aa},f_{aa})=(p_t^2,2p_t(1-p_t),(1-p_t)^2)`,
      },
      {
        text: "转换后的 pₛₘ 是下一代二项抽样的成功概率。",
        formula: String.raw`p_t\xrightarrow{\rm selection}p_s\xrightarrow{\rm mutation}p_{sm},\quad X_{t+1}\mid p_t\sim\operatorname{Binomial}(2N,p_{sm})`,
      },
      {
        text: "由二项分布的期望与方差除以相应拷贝数得到：",
        formula: String.raw`\mathbb E[p_{t+1}\mid p_t]=p_{sm},\quad\operatorname{Var}(p_{t+1}\mid p_t)=\frac{p_{sm}(1-p_{sm})}{2N}`,
      },
      {
        text: "这里的方差描述给定当前频率的一代抽样波动，不是任意时间的跨轨迹方差。选择或突变一般会改变条件期望。",
      },
    ],
  },
} satisfies Record<string, TheoryContent>;
