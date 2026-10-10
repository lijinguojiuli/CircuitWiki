import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles, articleHref } from "@/lib/content";
import {
  learningChapters,
  chapterId,
  lessonSectionLabel,
} from "@/lib/chapters";
import { KnowledgeCard } from "@/components/ui";
import { ChapterProgress, StudyResume } from "@/components/study-progress";
import { textbookTopics } from "@/lib/textbook-scope";
import { learningStages, lessonKind } from "@/lib/learning";

export const metadata = { title: "学习路线" };
export default function Curriculum() {
  return (
    <main id="main" className="page-container platform-page curriculum-page">
      <div className="platform-page-heading">
        <span className="platform-kicker">教材知识体系</span>
        <h1>学习路线</h1>
        <p className="platform-lead">
          从基本定律到三相电路，按邱关源《电路》第5版的章节顺序学习。
        </p>
        <div className="platform-facts">
          <span>{learningChapters.length} 个章节</span>
          <span>{articles.length} 篇学习页</span>
          <span>{textbookTopics.length} 节知识索引</span>
        </div>
      </div>
      <StudyResume />
      <section className="route-orientation" aria-label="学习路线使用说明">
        <strong>先建立全貌，再深入专题</strong>
        <p>
          每章的“章节全览”串联本章知识；专题提供更详细的图解、例题与交互。展开逐节清单，可按教材节号查找。
        </p>
      </section>
      <nav className="route-stages" aria-label="学习阶段跳转">
        {learningStages.map((stage, index) => (
          <a href={`#chapter-${stage.chapters[0]}`} key={stage.title}>
            <span>0{index + 1}</span>
            {stage.title}
            <small>第 {stage.chapters.join("、")} 章</small>
          </a>
        ))}
      </nav>
      <nav className="chapter-jumps" aria-label="教材章节跳转">
        {learningChapters.map((chapter) => (
          <Link key={chapter.number} href={`#${chapterId(chapter.number)}`}>
            第{chapter.number}章
          </Link>
        ))}
      </nav>
      {learningChapters.map((chapter) => {
        const stage = learningStages.find(
          (item) => item.chapters[0] === chapter.number,
        );
        return (
          <section
            id={chapterId(chapter.number)}
            className="curriculum-group"
            key={chapter.number}
          >
            {chapter.legacyAnchor && (
              <span id={chapter.legacyAnchor} className="legacy-anchor" />
            )}
            {stage && (
              <div className="route-stage-divider">
                <span>{stage.title}</span>
                <p>学完这一阶段：{stage.outcome}</p>
              </div>
            )}
            <div className="chapter-heading">
              <div>
                <span className="platform-kicker">第 {chapter.number} 章</span>
                <h2>{chapter.title}</h2>
              </div>
              <ChapterProgress slugs={chapter.slugs} />
            </div>
            <p className="chapter-description">{chapter.description}</p>
            <div className="curriculum-grid">
              {articles
                .filter((article) => chapter.slugs.includes(article.slug))
                .map((article) => (
                  <KnowledgeCard
                    key={article.slug}
                    title={article.title}
                    description={article.description}
                    secondaryTopics={article.secondaryTopics}
                    href={articleHref(article.slug)}
                    index={`${lessonSectionLabel(article.slug)} · ${lessonKind(article.slug)}`}
                    slug={article.slug}
                  />
                ))}
            </div>
            <details className="coverage-detail">
              <summary>
                本章逐节清单 ·{" "}
                {
                  textbookTopics.filter(
                    (topic) => topic.chapter === chapter.number,
                  ).length
                }{" "}
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
                      <small>
                        概念 · 公式 · 示例 <ArrowUpRight size={12} />
                      </small>
                    </Link>
                  ))}
              </div>
            </details>
          </section>
        );
      })}
    </main>
  );
}
