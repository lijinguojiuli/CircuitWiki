import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, sections, articleHref } from "@/lib/content";
import { ArticleBody } from "@/lib/mdx";
import { chapterForArticle, chapterLabel, chapterId } from "@/lib/chapters";
import { Breadcrumb, TableOfContents } from "@/components/ui";
import { textbookReferences } from "@/lib/textbook";
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
  return { title: article?.title, description: article?.description };
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
  return (
    <>
      <main id="main" className="article">
        <Breadcrumb
          category={chapterLabel(chapter)}
          categoryHref={`/curriculum#${chapterId(chapter.number)}`}
          title={article.title}
        />
        <div className="article-header">
          <div className="eyebrow">
            {chapterLabel(chapter)} / {article.core ? "核心知识" : "基础导读"}
          </div>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
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
        <details className="mobile-toc">
          <summary>展开本页目录</summary>
          <TableOfContents items={sections} />
        </details>
        <div className="prose">
          <ArticleBody article={article} />
        </div>
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
        <div className="toc-help">
          <span>学以致用</span>
          <p>在交互实验中验证你的理解。</p>
          <Link href="/tools">进入电路实验室 ↗</Link>
        </div>
      </aside>
    </>
  );
}
