import Link from "next/link";
import { articles, articleHref } from "@/lib/content";
import { chapters, chapterId } from "@/lib/chapters";
import { KnowledgeCard } from "@/components/ui";
export const metadata = { title: "学习路线" };
export default function Curriculum() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">教材学习路线 · 第1—12章</div>
      <h1>
        按教材章节学习<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">
        按邱关源《电路》第5版章节顺序组织，保留原章号。第5章跳过，第11章只学习谐振。当前提供
        {articles.filter((a) => a.core).length} 篇完整学习页，
        {articles.filter((a) => !a.core).length} 篇基础导读。
      </p>
      <nav className="chapter-jumps" aria-label="教材章节跳转">
        {chapters.map((chapter) => (
          <Link key={chapter.number} href={`#${chapterId(chapter.number)}`}>
            第{chapter.number}章
            {chapter.skipped
              ? " · 跳过"
              : chapter.number === 11
                ? " · 谐振"
                : ""}
          </Link>
        ))}
      </nav>
      {chapters.map((chapter) => (
        <section
          id={chapterId(chapter.number)}
          className={`curriculum-group${chapter.skipped ? " chapter-skipped" : ""}`}
          key={chapter.number}
        >
          {chapter.legacyAnchor && (
            <span id={chapter.legacyAnchor} className="legacy-anchor" />
          )}
          <h2>
            <span className="muted">第{chapter.number}章 / </span>
            {chapter.title}
          </h2>
          <p className="chapter-description">{chapter.description}</p>
          {chapter.skipped ? (
            <p className="scope-label">已跳过 · 不计入学习顺序</p>
          ) : (
            <div className="curriculum-grid">
              {articles
                .filter((a) => chapter.slugs.includes(a.slug))
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
          )}
        </section>
      ))}
    </main>
  );
}
