import { Explorer } from "../features/explorer/Explorer";
export default function App() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-mark" aria-hidden="true">
            Wf
          </span>
          <span>
            POPULATION GENETICS <b>交互实验室</b>
          </span>
        </a>
        <span className="version">
          CLASSICAL MODEL <span>v0.1</span>
        </span>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            CLASSICAL DIPLOID NEUTRAL WRIGHT–FISHER MODEL
          </div>
          <h1>
            Interactive <em>Wright–Fisher</em> Explorer
          </h1>
          <p>有限二倍体种群中等位基因频率的随机演化：遗传漂变、固定与丢失。</p>
          <div className="assumptions">
            <span>二倍体</span>
            <span>中性演化</span>
            <span>恒定种群</span>
            <span>单个位点 · A / a</span>
          </div>
        </section>
        <Explorer />
      </main>
      <footer>
        <span>Interactive Wright–Fisher Explorer</span>
        <span>群体遗传学 · 离散世代随机过程</span>
      </footer>
    </>
  );
}
