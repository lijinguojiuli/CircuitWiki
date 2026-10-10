import Link from "next/link";
import { articles } from "@/lib/content";
import { knowledgeRelations } from "@/lib/knowledge";

export function ArticleConnections({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const relations = knowledgeRelations(slug);
  const groups = [
    { label: "前置知识", values: relations.prerequisites },
    { label: "后续知识", values: relations.subsequent },
    { label: "相关概念", values: relations.related },
  ];
  return (
    <section
      className={`knowledge-connections ${compact ? "compact" : ""}`}
      aria-label="知识关系"
    >
      <div className="connections-heading">
        <h2>知识关系</h2>
        <Link href={`/graph#${slug}`}>查看关系图 ↗</Link>
      </div>
      <Link
        className="knowledge-parent"
        href={`/knowledge#${relations.parent.id}`}
      >
        上级知识 · {relations.parent.title}
      </Link>
      {groups.map(({ label, values }) => (
        <div className="relation-list" key={label}>
          <h3>{label}</h3>
          {values.length ? (
            values.slice(0, compact ? 3 : 8).map((item) => (
              <Link key={item} href={`/learn/${item}`}>
                {articles.find((article) => article.slug === item)!.title}
                <span aria-hidden="true">↗</span>
              </Link>
            ))
          ) : (
            <p>
              {label === "前置知识"
                ? "可从本页概念开始。"
                : "沿本章目录继续探索。"}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
