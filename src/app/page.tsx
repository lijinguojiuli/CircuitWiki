import Link from "next/link";
import { articles } from "@/lib/content";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Activity,
  Calculator,
  Check,
  GitBranch,
  Layers,
  Radio,
  Cpu,
  Wrench,
} from "lucide-react";
import { KnowledgeCard } from "@/components/ui";
import { CircuitDiagram } from "@/components/circuit-diagram";
const modules = [
  {
    title: "电路基础",
    description: "从基本定律到等效变换，建立电路分析的第一性原理。",
    href: "/learn/kcl-kvl",
    Icon: GitBranch,
    count: `${articles.filter((a) => a.category === "电路基础").length} 个知识点`,
  },
  {
    title: "动态电路",
    description: "理解储能元件，探索电路随时间变化的规律。",
    href: "/learn/rc-circuit",
    Icon: Activity,
    count: `${articles.filter((a) => a.category === "动态电路").length} 个知识点`,
  },
  {
    title: "交流电路",
    description: "用相量与阻抗，简化正弦稳态中的复杂运算。",
    href: "/learn/phasor",
    Icon: Radio,
    count: `${articles.filter((a) => a.category === "正弦稳态").length} 个知识点`,
  },
  {
    title: "三相电路",
    description: "学习教材第十二章，分清线量与相量，掌握三相计算和功率。",
    href: "/learn/three-phase-basics",
    Icon: Radio,
    count: `${articles.filter((a) => a.category === "三相电路").length} 个知识点`,
  },
  {
    title: "模拟电子",
    description: "从二极管、晶体管到运算放大器，连接真实信号。",
    href: "/topics/analog",
    Icon: Layers,
    count: "课程规划",
  },
  {
    title: "数字电路",
    description: "从逻辑门到时序电路，理解数字系统的工作方式。",
    href: "/topics/digital",
    Icon: Cpu,
    count: "课程规划",
  },
  {
    title: "电路工具",
    description: "让参数动起来，让计算、波形与抽象公式变得直观。",
    href: "/tools",
    Icon: Wrench,
    count: "03 个交互工具",
  },
];
export default function Home() {
  return (
    <main id="main" className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Circuit<span>Wiki</span>
            <small>交互式电路知识库</small>
          </h1>
          <p>
            面向电气、电子与自动化专业学生的
            <br className="desktop-break" />
            系统化电路学习平台。
          </p>
          <div className="hero-features">
            <span>
              <Check />
              知识总结
            </span>
            <span>
              <Check />
              公式速查
            </span>
            <span>
              <Check />
              交互计算
            </span>
            <span>
              <Check />
              波形演示
            </span>
            <span>
              <Check />
              典型例题
            </span>
          </div>
          <div className="hero-actions">
            <Link className="button primary" href="/learn/chapter-1-summary">
              开始学习 <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/tools">
              探索电路工具 <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="hero-lab">
          <div className="lab-title">
            <span>RC 一阶电路</span>
            <span className="live-badge">电路与响应示意</span>
          </div>
          <CircuitDiagram type="rc" />
          <div className="hero-wave">
            <div>
              <span>电容充电响应 uC</span>
              <strong>τ = RC</strong>
            </div>
            <svg viewBox="0 0 430 125" role="img" aria-label="电容充电示意波形">
              <path
                className="wave-grid"
                d="M25 15H415M25 55H415M25 95H415M25 15V110M105 15V110M185 15V110M265 15V110M345 15V110"
              />
              <path
                d="M25 110C65 42 130 19 210 15S350 12 415 12"
                stroke="var(--accent)"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="105" cy="37" r="5" fill="var(--accent)" />
              <text x="113" y="57">
                63.2%
              </text>
              <text x="397" y="123">
                t / s
              </text>
            </svg>
          </div>
          <Link className="lab-bottom" href="/tools#rc">
            <span>改变参数，发现规律</span>
            <span>
              打开交互实验 <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      </section>
      <div className="value-strip">
        <div>
          <BookOpen />
          <span>
            <strong>{articles.length}</strong> 个知识点
          </span>
        </div>
        <div>
          <Calculator />
          <span>
            <strong>3</strong> 个交互工具
          </span>
        </div>
        <div>
          <Activity />
          <span>
            公式与波形，<strong>同步理解</strong>
          </span>
        </div>
        <div>
          <GitBranch />
          <span>
            知识之间，<strong>彼此相连</strong>
          </span>
        </div>
      </div>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>知识目录</h2>
            <p>从基础规律出发，把零散的知识连接成体系。</p>
          </div>
          <Link href="/curriculum">
            查看学习路线 <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="module-grid">
          {modules.map(({ Icon, ...m }, i) => (
            <div className="module-wrapper" key={m.title}>
              <div className={`module-icon color-${i}`}>
                <Icon size={22} />
              </div>
              <span className="module-count">{m.count}</span>
              <KnowledgeCard
                title={m.title}
                description={m.description}
                href={m.href}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="quick-section">
        <div>
          <h2>快速查阅</h2>
          <p>常用知识，随时查阅。</p>
        </div>
        <div className="quick-links">
          {[
            ["KCL / KVL", "kcl-kvl"],
            ["节点电压法", "nodal-analysis"],
            ["戴维宁定理", "thevenin"],
            ["RC 一阶电路", "rc-circuit"],
            ["正弦稳态", "sinusoidal"],
            ["相量", "phasor"],
          ].map(([title, slug]) => (
            <Link href={`/learn/${slug}`} key={slug}>
              {title}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      <section className="home-bottom">
        <div>
          <h2>交互计算</h2>
          <p>输入电路参数，计算结果并查看响应曲线。</p>
        </div>
        <Link className="button primary" href="/tools">
          进入电路实验室 <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
