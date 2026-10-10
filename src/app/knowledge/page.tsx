import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { articles } from "@/lib/content";
import { knowledgeAreas, articlesInArea } from "@/lib/knowledge";
import { KnowledgeCard } from "@/components/ui";
import { lessonKind } from "@/lib/learning";
export const metadata = pageMetadata(
  "知识体系",
  "按学科主题发现电路知识，沿前置、后续与相关关系建立知识体系。",
  "/knowledge",
  true,
);
export default function KnowledgePage() {
  return (
    <main id="main" className="page-container platform-page knowledge-page">
      <div className="platform-kicker">发现知识 · 建立关联</div>
      <h1>把电路知识连成体系</h1>
      <p className="platform-lead">
        按主题发现概念，按教材系统学习，沿知识关系补齐理解。当前电路理论包含{" "}
        {articles.length} 篇学习页。
      </p>
      <div className="workspace-actions">
        <Link className="button primary" href="/graph">
          探索知识关系图 →
        </Link>
        <Link className="button secondary" href="/curriculum">
          按教材章节学习
        </Link>
      </div>
      <nav className="anchor-pills" aria-label="知识主题">
        {knowledgeAreas.map((area) => (
          <a href={`#${area.id}`} key={area.id}>
            {area.title}
          </a>
        ))}
      </nav>
      {knowledgeAreas.map((area) => (
        <section id={area.id} key={area.id} className="knowledge-area">
          <div className="area-heading">
            <div>
              <span className="platform-kicker">电路理论 / {area.title}</span>
              <h2>{area.title}</h2>
              <p>{area.description}</p>
            </div>
            <span>{articlesInArea(area.id).length} 篇</span>
          </div>
          <div className="curriculum-grid">
            {articlesInArea(area.id).map((article) => (
              <KnowledgeCard
                key={article.slug}
                slug={article.slug}
                title={article.title}
                description={article.description}
                href={`/learn/${article.slug}`}
                index={lessonKind(article.slug)}
                secondaryTopics={article.secondaryTopics}
              />
            ))}
          </div>
        </section>
      ))}
      <details className="future-domains">
        <summary>工程知识的其他领域 · 建设范围</summary>
        <p>
          当前学习内容集中在电路理论。以下分支将在内容完善后逐步开放，不计入现有课程。
        </p>
        <ul>
          <li>模拟电子技术：二极管、三极管、运算放大器</li>
          <li>数字电子技术：逻辑门、触发器、FPGA基础</li>
          <li>电力系统：发电、输电、继电保护</li>
        </ul>
      </details>
    </main>
  );
}
