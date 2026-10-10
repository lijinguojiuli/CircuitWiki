import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Lightbulb, TriangleAlert, Info } from "lucide-react";
import { CompletionMark } from "./study-progress";
export function SecondaryBadge() {
  return <span className="secondary-badge">非重点</span>;
}
export function SecondaryTopic({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="secondary-topic"
      id={id}
      data-learning-emphasis="secondary"
    >
      <div className="secondary-topic-label">
        <SecondaryBadge />
        <strong>{title}</strong>
      </div>
      {children}
    </section>
  );
}
export function Callout({
  children,
  title = "提示",
  kind = "tip",
}: {
  children: ReactNode;
  title?: string;
  kind?: "tip" | "warning" | "important";
}) {
  const Icon =
    kind === "warning"
      ? TriangleAlert
      : kind === "important"
        ? Info
        : Lightbulb;
  return (
    <aside className={`callout ${kind}`}>
      <Icon size={19} />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </aside>
  );
}
export function Warning({ children }: { children: ReactNode }) {
  return (
    <Callout title="常见错误" kind="warning">
      {children}
    </Callout>
  );
}
export function Tip({ children }: { children: ReactNode }) {
  return <Callout title="学习提示">{children}</Callout>;
}
export function Example({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="example">
      <div className="eyebrow">典型例题</div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function KnowledgeCard({
  title,
  description,
  href,
  index,
  secondaryTopics,
  slug,
}: {
  title: string;
  description: string;
  href: string;
  index?: string;
  secondaryTopics?: readonly string[];
  slug?: string;
}) {
  return (
    <Link className="knowledge-card" href={href}>
      <span className="card-index">{index ?? "↗"}</span>
      {slug && <CompletionMark slug={slug} />}
      <ArrowUpRight className="card-arrow" size={20} />
      <h3>{title}</h3>
      <p>{description}</p>
      {secondaryTopics && (
        <div className="secondary-topic-label">
          <SecondaryBadge />
          <span>{secondaryTopics.join("、")}</span>
        </div>
      )}
      <span className="card-link">打开学习页 →</span>
    </Link>
  );
}
export function Breadcrumb({
  category,
  categoryHref,
  title,
}: {
  category: string;
  categoryHref?: string;
  title: string;
}) {
  return (
    <nav aria-label="面包屑" className="breadcrumb">
      <Link href="/">首页</Link>
      <span>/</span>
      <Link href={categoryHref ?? `/curriculum#${category}`}>{category}</Link>
      <span>/</span>
      <span>{title}</span>
    </nav>
  );
}
export { TableOfContents } from "./reading-toc";
