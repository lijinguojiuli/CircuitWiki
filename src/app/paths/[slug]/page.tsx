import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { learningPaths } from "@/lib/paths";
import { articles } from "@/lib/content";
import { ChapterProgress } from "@/components/study-progress";
import { KnowledgeCard } from "@/components/ui";
export const dynamicParams = false;
export function generateStaticParams() {
  return learningPaths.map((path) => ({ slug: path.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = learningPaths.find((item) => item.slug === slug);
  return path
    ? pageMetadata(path.title, path.description, `/paths/${slug}`)
    : {};
}
export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = learningPaths.find((item) => item.slug === slug);
  if (!path) notFound();
  return (
    <main id="main" className="page-container platform-page">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link href="/paths">推荐路径</Link>
        <span>/</span>
        <span>{path.title}</span>
      </nav>
      <div className="platform-page-heading">
        <span className="platform-kicker">
          {path.audience} · {path.slugs.length} 篇学习页
        </span>
        <h1>{path.title}</h1>
        <p className="platform-lead">{path.description}</p>
      </div>
      <div className="path-brief">
        <div>
          <strong>开始前</strong>
          <p>{path.prerequisite}</p>
        </div>
        <div>
          <strong>学完能做什么</strong>
          <p>{path.outcome}</p>
        </div>
        <ChapterProgress slugs={path.slugs} />
      </div>
      <Link className="button primary" href={`/learn/${path.slugs[0]}`}>
        开始这条路径 →
      </Link>
      <div className="path-lessons">
        {path.slugs.map((item, index) => {
          const article = articles.find((article) => article.slug === item)!;
          return (
            <KnowledgeCard
              key={item}
              slug={item}
              title={article.title}
              description={article.description}
              href={`/learn/${item}`}
              index={`${String(index + 1).padStart(2, "0")} / ${path.slugs.length}`}
            />
          );
        })}
      </div>
    </main>
  );
}
