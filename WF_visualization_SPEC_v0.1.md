# Interactive Wright--Fisher Explorer

## 项目规格说明（SPEC）

版本：v0.1

------------------------------------------------------------------------

# 1. 项目目标

Interactive Wright--Fisher Explorer
是一个用于理解群体遗传学核心模型的交互式可视化工具。

第一阶段目标：

实现经典二倍体 Wright--Fisher 模型，并通过交互式模拟帮助用户理解：

-   genetic drift（遗传漂变）
-   allele frequency dynamics（等位基因频率变化）
-   fixation（固定）
-   loss（丢失）
-   finite population sampling（有限种群随机抽样）

长期目标：

构建连接 forward-time 和 backward-time 的教学平台：

$$
\text{Forward-time Wright--Fisher}
\longleftrightarrow
\text{Backward-time Coalescent}
$$

------------------------------------------------------------------------

# 2. 理论解释面板（Theory Panel）设计

## 2.1 总体原则

理论解释面板不直接固定展示在主可视化界面中。

原因：

-   避免主界面信息过载；
-   保持模拟过程直观；
-   允许初学者先观察现象，再主动探索数学原理。

因此：

$$
\boxed{
\text{Visualization first}
\rightarrow
\text{Theory on demand}
}
$$

------------------------------------------------------------------------

## 2.2 理论解释面板结构

每个参数、每个模型模块都包含可折叠解释区域：

点击展开后显示：

### A. 生物学假设

解释：

-   生物学意义；
-   Wright--Fisher 模型假设；
-   参数作用；
-   模拟过程直觉。

------------------------------------------------------------------------

### B. 数学原理

解释：

-   随机变量定义；
-   抽样分布；
-   期望；
-   方差；
-   相关数学推导。

------------------------------------------------------------------------

# 3. Wright--Fisher 模型基本生物学假设

经典二倍体 Wright--Fisher 模型生物学假设：

## 3.1 有限二倍体种群

种群大小固定：

$$
N
$$

其中：

-   $N$：diploid individuals 数量。

由于每个个体有两个 allele copies：

$$
2N
$$

表示总 allele copy 数量。

------------------------------------------------------------------------

## 3.2 随机繁殖

下一代 allele copies 从上一代 allele pool 中随机抽取。

不考虑：

-   selection
-   mutation
-   migration
-   recombination

因此这是 neutral Wright--Fisher model。

------------------------------------------------------------------------

## 3.3 每代种群大小恒定

每一代：

$$
N_t=N
$$

不会发生：

-   population growth
-   bottleneck
-   population split

------------------------------------------------------------------------

## 3.4 随机漂变来源

genetic drift 并不是额外过程，而来源于：

$$
\text{finite random sampling}
$$

有限数量 allele copies 的随机抽样导致 allele frequency 改变。

------------------------------------------------------------------------

# 4. 参数定义

## Population size

变量：

$$
N
$$

定义：

$$
N=\text{number of diploid individuals}
$$

总 allele copies：

$$
2N
$$

------------------------------------------------------------------------

## Allele frequency

变量：

$$
p_t
$$

定义：

第 $t$ 代 allele A 的频率：

$$
p_t=\frac{X_t}{2N}
$$

其中：

$$
X_t
$$

表示第 $t$ 代 allele A 的 copy 数。

------------------------------------------------------------------------

## Generation

变量：

$$
t
$$

表示离散世代：

$$
t=0,1,2,\dots,T
$$

------------------------------------------------------------------------

# 5. 数学原理

## 5.1 Wright--Fisher 抽样分布

下一代 allele 数量：

$$
X_{t+1}|p_t
\sim
Binomial(2N,p_t)
$$

其中：

$$
X_{t+1}
$$

是下一代 allele A 的数量。

因此：

$$
p_{t+1}
=
\frac{X_{t+1}}{2N}
$$

------------------------------------------------------------------------

# 6. 条件期望推导

二项分布：

$$
E[X]=np
$$

令：

$$
n=2N
$$

因此：

$$
E[X_{t+1}|p_t]
=
2Np_t
$$

因为：

$$
p_{t+1}
=
\frac{X_{t+1}}{2N}
$$

所以：

$$
E[p_{t+1}|p_t]
=
\frac{E[X_{t+1}|p_t]}{2N}
$$

得到：

$$
\boxed{
E[p_{t+1}|p_t]=p_t
}
$$

解释：

neutral Wright--Fisher 没有方向性改变 allele frequency。

------------------------------------------------------------------------

# 7. 条件方差推导

二项分布：

$$
Var(X)=np(1-p)
$$

因此：

$$
Var(X_{t+1}|p_t)
=
2Np_t(1-p_t)
$$

因为：

$$
p_{t+1}
=
\frac{X_{t+1}}{2N}
$$

所以：

$$
Var(p_{t+1}|p_t)
=
\frac{Var(X_{t+1}|p_t)}{(2N)^2}
$$

得到：

$$
\boxed{
Var(p_{t+1}|p_t)
=
\frac{p_t(1-p_t)}{2N}
}
$$

解释：

$$
N\downarrow
\Rightarrow
Var(p_{t+1}|p_t)\uparrow
$$

因此：

小种群具有更强 genetic drift。

------------------------------------------------------------------------

# 8. 可视化设计

主界面只显示：

-   参数控制；
-   allele frequency trajectory；
-   模拟结果。

理论解释通过折叠组件展开：

例如：

    Population size N
        ▼
        Natural explanation
        ▼
        Mathematical derivation

------------------------------------------------------------------------

# 9. 未来扩展

理论面板架构必须支持：

## Selection

fitness：

$$
w_{AA},w_{Aa},w_{aa}
$$

------------------------------------------------------------------------

## Mutation

$$
A\rightleftharpoons a
$$

------------------------------------------------------------------------

## Migration

$$
p_i'=(1-m)p_i+mp_j
$$

------------------------------------------------------------------------

## Backward-time Coalescent

状态变量：

$$
k=\text{number of ancestral lineages}
$$

共祖概率：

$$
P(\text{coalescence})
=
\frac{1}{2N}
$$

最终目标：

$$
\text{Wright--Fisher}
\rightarrow
\text{Kingman coalescent}
$$

------------------------------------------------------------------------

# 10. 开发原则

-   可视化与数学模型分离；
-   每个参数必须有数学定义；
-   每个模型必须有理论解释；
-   每个扩展模块必须有明确数学过程；
-   理论内容默认隐藏，通过用户主动展开访问。
