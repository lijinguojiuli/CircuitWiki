import { articles, categories, articleHref } from "@/lib/content";
import { KnowledgeCard } from "@/components/ui";
export const metadata = { title: "学习路线" };
export default function Curriculum() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">知识库</div>
      <h1>
        电路知识地图<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">
        从守恒定律出发，经由动态响应，走向正弦稳态。6 篇完整核心课，10
        篇基础导读。
      </p>
      {categories.map((c, i) => (
        <section id={c} className="curriculum-group" key={c}>
          <h2>
            <span className="muted">0{i + 1} / </span>
            {c}
          </h2>
          <div className="curriculum-grid">
            {articles
              .filter((a) => a.category === c)
              .map((a, j) => (
                <KnowledgeCard
                  key={a.slug}
                  title={a.title}
                  description={a.description}
                  href={articleHref(a.slug)}
                  index={`${a.core ? "核心" : "导读"} · ${j + 1}`}
                />
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
