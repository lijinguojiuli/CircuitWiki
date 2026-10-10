"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { articles } from "@/lib/content";
import { knowledgeRelations } from "@/lib/knowledge";

export function KnowledgeGraph() {
  const [slug, setSlug] = useState("nodal-analysis");
  const [list, setList] = useState(false);
  useEffect(() => {
    const restore = () => {
      let hash: string;
      try {
        hash = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (articles.some((article) => article.slug === hash)) setSlug(hash);
    };
    const frame = requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restore);
    };
  }, []);
  const choose = (value: string) => {
    setSlug(value);
    window.history.replaceState(null, "", `#${value}`);
  };
  const current = articles.find((article) => article.slug === slug)!;
  const relations = knowledgeRelations(slug);
  const column = (label: string, values: readonly string[]) => (
    <div className="graph-column">
      <h2>{label}</h2>
      {values.length ? (
        values.map((item) => (
          <button
            className="graph-node"
            key={item}
            onClick={() => choose(item)}
          >
            {articles.find((article) => article.slug === item)!.title}
            <span>查看关联 →</span>
          </button>
        ))
      ) : (
        <p className="graph-empty">
          {label === "前置知识" ? "可直接从本页开始。" : "继续探索相关概念。"}
        </p>
      )}
    </div>
  );
  return (
    <div className="graph-workspace">
      <div className="workspace-toolbar">
        <label>
          中心知识点
          <select
            aria-label="中心知识点"
            value={slug}
            onChange={(event) => choose(event.target.value)}
          >
            {articles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          onClick={() => setList(!list)}
          aria-pressed={list}
        >
          {list ? "关系图视图" : "文本列表视图"}
        </button>
      </div>
      <p className="muted">
        箭头方向表示“先理解 →
        再学习”，相关概念表示横向联系。点击节点可探索它的关系。
      </p>
      <div className={`graph-neighborhood ${list ? "graph-as-list" : ""}`}>
        {column("前置知识", relations.prerequisites)}
        <div className="graph-center">
          <span className="platform-kicker">当前知识点</span>
          <h2>{current.title}</h2>
          <p>{current.description}</p>
          <Link className="button primary" href={`/learn/${slug}`}>
            阅读知识页 →
          </Link>
        </div>
        {column("后续知识", relations.subsequent)}
      </div>
      <div className="graph-related">
        <h2>相关概念</h2>
        {relations.related.map((item) => (
          <button
            className="graph-node"
            key={item}
            onClick={() => choose(item)}
          >
            {articles.find((article) => article.slug === item)!.title}
          </button>
        ))}
      </div>
      <p className="graph-note">
        关系由本站维护，教材章、节顺序仍以学习路线为准。已学习状态属于个人记录，不代表自动评价掌握程度。
      </p>
    </div>
  );
}
