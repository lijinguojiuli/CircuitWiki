import Link from "next/link";
import { articles, articleHref } from "@/lib/content";
import { chapters, chapterId, lessonSectionLabel } from "@/lib/chapters";
import { KnowledgeCard } from "@/components/ui";
import { textbookTopics, learningScopeNotes } from "@/lib/textbook-scope";
export const metadata = { title: "学习路线" };
export default function Curriculum() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">教材学习路线 · 第1—12章</div>
      <h1>
        按教材章节学习<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">
        按邱关源《电路》第5版章节顺序组织，保留原章号。当前{articles.length}
        篇学习页，
        {textbookTopics.length}
        节学习清单。第四章与第七章只学各自§1至§4，第五章跳过，第十一章仅谐振。
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
          {learningScopeNotes[chapter.number] && (
            <p className="scope-label">{learningScopeNotes[chapter.number]}</p>
          )}
          {chapter.skipped ? (
            <p className="scope-label">已跳过 · 不计入学习顺序</p>
          ) : (
            <div className="curriculum-grid">
              {articles
                .filter((a) => chapter.slugs.includes(a.slug))
                .map((a) => (
                  <KnowledgeCard
                    key={a.slug}
                    title={a.title}
                    description={a.description}
                    href={articleHref(a.slug)}
                    index={`${lessonSectionLabel(a.slug)} · ${a.core ? "核心" : "导读"}${a.slug === "bridge-arm" ? " · 补充例题" : ""}`}
                  />
                ))}
            </div>
          )}
          {!chapter.skipped && (
            <details className="coverage-detail">
              <summary>
                本章逐节清单 ·{" "}
                {
                  textbookTopics.filter(
                    (topic) => topic.chapter === chapter.number,
                  ).length
                }
                节
              </summary>
              <div className="coverage-grid">
                {textbookTopics
                  .filter((topic) => topic.chapter === chapter.number)
                  .map((topic) => (
                    <Link
                      key={topic.section}
                      href={`/learn/${topic.slug}#${topic.anchor}`}
                    >
                      <span>
                        §{topic.chapter}-{topic.section}
                      </span>
                      {topic.title}
                      <small>概念 · 公式 · 示例</small>
                    </Link>
                  ))}
              </div>
            </details>
          )}
        </section>
      ))}
    </main>
  );
}
