import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, sections, articleHref } from "@/lib/content";
import { ArticleBody } from "@/lib/mdx";
import { chapterForArticle, chapterLabel, chapterId } from "@/lib/chapters";
import { Breadcrumb, TableOfContents, SecondaryBadge } from "@/components/ui";
import { textbookReferences } from "@/lib/textbook";
import { lessonKind, relatedTool } from "@/lib/learning";
import { LessonProgress } from "@/components/study-progress";
import { ArticleConnections } from "@/components/article-connections";
import { BookmarkButton, ReadingProgress } from "@/components/reading-tools";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return article
    ? pageMetadata(article.title, article.description, `/learn/${slug}`)
    : {};
}
export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = articles.findIndex((a) => a.slug === slug);
  if (index < 0) notFound();
  const article = articles[index];
  const chapter = chapterForArticle(slug);
  const tool = relatedTool(slug);
  return (
    <>
      <main id="main" className="article">
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: article.title,
            description: article.description,
            url: `${siteUrl}/learn/${slug}`,
            inLanguage: "zh-CN",
            isAccessibleForFree: true,
            learningResourceType: "知识专题",
            publisher: { "@type": "Organization", name: "CircuitWiki" },
          }}
        />
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "首页", item: siteUrl },
              {
                "@type": "ListItem",
                position: 2,
                name: chapterLabel(chapter),
                item: `${siteUrl}/curriculum#${chapterId(chapter.number)}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.title,
                item: `${siteUrl}/learn/${slug}`,
              },
            ],
          }}
        />
        <Breadcrumb
          category={chapterLabel(chapter)}
          categoryHref={`/curriculum#${chapterId(chapter.number)}`}
          title={article.title}
        />
        <div className="article-header">
          <div className="eyebrow">
            {chapterLabel(chapter)} / {lessonKind(slug)}
          </div>
          <h1>{article.title}</h1>
          <div className="article-learning-tools">
            <ReadingProgress slug={slug} />
            <BookmarkButton slug={slug} />
          </div>
          <p>{article.description}</p>
          {article.secondaryTopics && (
            <div className="secondary-topic-label">
              <SecondaryBadge />
              <span>{article.secondaryTopics.join("、")}</span>
            </div>
          )}
          <div className="article-meta">
            <span>
              ◷ {article.readTime ?? (article.core ? "8–12" : "3–5")} 分钟
            </span>
            <span>理论 · 公式 · 实践</span>
          </div>
          <p className="book-reference">
            《电路》第5版 · {textbookReferences[slug].section} · 书页{" "}
            {textbookReferences[slug].pages}
          </p>
        </div>
        <nav className="lesson-shortcuts" aria-label="本页学习入口">
          <a href="#section-1">理解概念</a>
          <a href="#section-3">查看公式</a>
          <a href="#section-6">跟着例题练习</a>
          {!slug.startsWith("chapter-") && (
            <Link href={`/learn/chapter-${chapter.number}-summary`}>
              本章全览 ↗
            </Link>
          )}
        </nav>
        <details className="mobile-toc">
          <summary>展开本页目录</summary>
          <TableOfContents items={sections} />
        </details>
        <details className="mobile-connections">
          <summary>前置知识与相关概念</summary>
          <ArticleConnections slug={slug} />
        </details>
        <div className="prose">
          <ArticleBody article={article} />
        </div>
        <LessonProgress slug={slug} />
        <nav className="prev-next" aria-label="文章翻页">
          {index > 0 ? (
            <Link href={articleHref(articles[index - 1].slug)}>
              <small>← 上一篇</small>
              {articles[index - 1].title}
            </Link>
          ) : (
            <span />
          )}
          {index < articles.length - 1 && (
            <Link href={articleHref(articles[index + 1].slug)}>
              <small>下一篇 →</small>
              {articles[index + 1].title}
            </Link>
          )}
        </nav>
      </main>
      <aside className="right-sidebar">
        <TableOfContents items={sections} />
        <ArticleConnections slug={slug} compact />
        <div className="toc-help">
          <span>配合学习</span>
          <p>查公式的条件与符号，再用计算验证理解。</p>
          <Link href={`/formulas#formula-chapter-${chapter.number}`}>
            本章公式速查 ↗
          </Link>
          {tool && <Link href={`/tools#${tool.id}`}>{tool.title} ↗</Link>}
        </div>
      </aside>
    </>
  );
}
