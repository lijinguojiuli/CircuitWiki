import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Lightbulb, TriangleAlert, Info } from "lucide-react";
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
}: {
  title: string;
  description: string;
  href: string;
  index?: string;
}) {
  return (
    <Link className="knowledge-card" href={href}>
      <span className="card-index">{index ?? "↗"}</span>
      <ArrowUpRight className="card-arrow" size={20} />
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="card-link">探索知识模块 →</span>
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
export function TableOfContents({ items }: { items: string[] }) {
  return (
    <nav className="toc" aria-label="本页目录">
      <p className="eyebrow">阅读导航</p>
      <strong>本页目录</strong>
      {items.map((item, i) => (
        <a href={`#section-${i + 1}`} key={item}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          {item}
        </a>
      ))}
    </nav>
  );
}
