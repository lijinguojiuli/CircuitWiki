import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Search,
  GitBranch,
  Activity,
  Radio,
  Layers,
  Network,
} from "lucide-react";
import { articles } from "@/lib/content";
import { formulas } from "@/lib/formulas";
import { learningStages, stageLessons } from "@/lib/learning";
import { StudyResume } from "@/components/study-progress";
import { CircuitDiagram } from "@/components/circuit-diagram";
import { learningPaths } from "@/lib/paths";
import { contentUpdates } from "@/lib/updates";

const stageIcons = [GitBranch, Network, Activity, Radio, Layers, Network];
export default function Home() {
  return (
    <main id="main" className="platform-page platform-home">
      <section className="platform-hero">
        <div>
          <div className="platform-kicker">CIRCUITWIKI / 交互式电路知识库</div>
          <h1>
            理解电路，
            <br />
            从每一个连接开始。
          </h1>
          <p className="platform-lead">
            面向大学生、工程师与电子爱好者。从电路理论出发，连接概念、公式、图解与实验，建立属于自己的知识体系。
          </p>
          <div className="platform-actions">
            <Link className="button primary" href="/learn/chapter-1-summary">
              开始学习
              <ArrowRight size={17} />
            </Link>
            <Link className="button secondary" href="/knowledge">
              探索知识体系
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="platform-facts">
            <span>{articles.length} 篇学习页</span>
            <span>{formulas.length} 条公式</span>
            <span>教材顺序 · 逐节串联</span>
          </div>
          <form className="home-search-form" action="/search">
            <label htmlFor="home-search">从一个问题开始</label>
            <div>
              <Search size={17} />
              <input
                id="home-search"
                name="q"
                placeholder="搜索知识点、公式或符号"
              />
              <button type="submit" aria-label="搜索知识">
                搜索 →
              </button>
            </div>
          </form>
        </div>
        <div className="platform-preview">
          <div className="platform-preview-title">
            <span>一个知识点，多种理解方式</span>
            <span>RC 一阶电路</span>
          </div>
          <CircuitDiagram type="rc" />
          <div className="platform-preview-bottom">
            <div>
              <strong>从电路图读懂充电过程</strong>
              <p>先看连接，再理解公式，最后改变参数。</p>
            </div>
            <Link href="/learn/rc-circuit" aria-label="学习 RC 一阶电路">
              <ArrowUpRight size={22} />
            </Link>
          </div>
        </div>
      </section>
      <div className="platform-intents" aria-label="按学习目的进入">
        {[
          {
            Icon: BookOpen,
            title: "系统学习",
            text: "按章建立概念，跟着例题掌握方法。",
            href: "/curriculum",
            action: "浏览学习路线",
          },
          {
            Icon: Search,
            title: "解题时查公式",
            text: "查适用条件、符号含义与参数单位。",
            href: "/formulas",
            action: "打开公式速查",
          },
          {
            Icon: Calculator,
            title: "动手验证",
            text: "调整参数，观察计算结果和响应曲线。",
            href: "/tools",
            action: "进入电路工具",
          },
        ].map(({ Icon, title, text, href, action }) => (
          <Link href={href} key={title}>
            <Icon size={21} />
            <h2>{title}</h2>
            <p>{text}</p>
            <span>
              {action}
              <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>
      <StudyResume />
      <section className="platform-section">
        <div className="platform-section-heading">
          <div>
            <span className="platform-kicker">推荐学习路径</span>
            <h2>找到适合你的起点</h2>
            <p>从零入门、复习方法，或专注一个专题。</p>
          </div>
          <Link href="/paths">查看全部路径 ↗</Link>
        </div>
        <div className="path-grid">
          {learningPaths.map((path) => (
            <Link
              className="path-card"
              key={path.slug}
              href={`/paths/${path.slug}`}
            >
              <span className="platform-kicker">{path.audience}</span>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <div>
                <span>{path.slugs.length} 篇学习页</span>
                <span>查看路径 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="platform-section">
        <div className="platform-section-heading">
          <div>
            <span className="platform-kicker">知识体系</span>
            <h2>把知识连成一条学习路径</h2>
            <p>六个学习阶段，沿邱关源《电路》第5版的章节顺序展开。</p>
          </div>
          <Link href="/curriculum">
            查看全部章节
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="stage-grid">
          {learningStages.map((stage, index) => {
            const lessons = stageLessons(stage.chapters);
            const Icon = stageIcons[index];
            return (
              <Link
                className="stage-card"
                href={`/curriculum#chapter-${stage.chapters[0]}`}
                key={stage.title}
              >
                <div className="stage-card-top">
                  <span className="stage-number">0{index + 1}</span>
                  <Icon size={20} />
                  <ArrowUpRight size={17} />
                </div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <div className="stage-card-bottom">
                  <span>第 {stage.chapters.join("、")} 章</span>
                  <span>{lessons.length} 篇学习页</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="platform-section platform-popular">
        <div>
          <span className="platform-kicker">随手查阅</span>
          <h2>热门知识 · 编辑精选</h2>
          <p>
            已经有具体问题？直接进入对应专题。
            <br />
            顶部搜索支持知识点、公式与工具。
          </p>
          <kbd>Ctrl / ⌘ K</kbd>
        </div>
        <div className="platform-popular-links">
          {[
            "kcl-kvl",
            "nodal-analysis",
            "mesh-analysis",
            "thevenin",
            "rc-circuit",
            "phasor",
          ].map((slug) => {
            const article = articles.find((item) => item.slug === slug)!;
            return (
              <Link key={slug} href={`/learn/${slug}`}>
                <span>
                  {article.title}
                  <small>{article.description}</small>
                </span>
                <ArrowUpRight size={18} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="platform-section">
        <div className="platform-section-heading">
          <div>
            <span className="platform-kicker">持续维护</span>
            <h2>最新内容更新</h2>
            <p>记录真实的内容修订，帮助你及时回顾。</p>
          </div>
        </div>
        <div className="content-updates">
          {contentUpdates.map((update) => (
            <Link href={`/learn/${update.slug}`} key={update.title}>
              <time dateTime={update.date}>{update.date}</time>
              <div>
                <h3>{update.title}</h3>
                <p>{update.description}</p>
              </div>
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      </section>
      <section className="platform-method">
        <span className="platform-kicker">推荐学习方式</span>
        <h2>读概念 → 看公式 → 跟例题 → 做验证</h2>
        <p>
          知识页中保留前置知识、解题步骤和常见错误。遇到卡点，回到对应概念；理解后，标记完成并继续下一页。
        </p>
        <Link href="/curriculum">
          找到你的起点
          <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
