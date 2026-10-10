"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { matchesSearch } from "@/lib/search";

type FormulaGroup = {
  number: number;
  title: string;
  entries: {
    id: string;
    search: string;
    position: string;
    content: ReactNode;
  }[];
};
export function FormulaBrowser({ groups }: { groups: FormulaGroup[] }) {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  useEffect(() => {
    const reveal = () => {
      setQuery("");
      setChapter("all");
    };
    window.addEventListener("circuitwiki:reveal-formula", reveal);
    return () =>
      window.removeEventListener("circuitwiki:reveal-formula", reveal);
  }, []);
  const visible = groups
    .filter((group) => chapter === "all" || String(group.number) === chapter)
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) =>
        matchesSearch(query, entry.search),
      ),
    }))
    .filter((group) => group.entries.length);
  const count = visible.reduce(
    (total, group) => total + group.entries.length,
    0,
  );
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);
  return (
    <div className="formula-browser">
      <div className="reference-toolbar">
        <label className="reference-search">
          <Search size={18} />
          <input
            aria-label="筛选公式"
            placeholder="搜索公式名称或符号，例如 Req、时间常数"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button aria-label="清空公式搜索" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </label>
        <label className="reference-chapter">
          <span>章节</span>
          <select
            aria-label="筛选公式章节"
            value={chapter}
            onChange={(event) => setChapter(event.target.value)}
          >
            <option value="all">全部章节</option>
            {groups.map((group) => (
              <option key={group.number} value={group.number}>
                第{group.number}章
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="reference-results-meta">
        <span role="status" aria-live="polite">
          显示 {count} / {total} 条公式
        </span>
        <span>按教材章、节顺序排列</span>
      </div>
      <nav className="anchor-pills" aria-label="公式章节跳转">
        {visible.map((group) => (
          <a key={group.number} href={`#formula-chapter-${group.number}`}>
            第{group.number}章
          </a>
        ))}
      </nav>
      {visible.map((group) => (
        <section
          id={`formula-chapter-${group.number}`}
          className="formula-group"
          key={group.number}
        >
          <h2>{group.title}</h2>
          <div className="formula-grid">
            {group.entries.map((entry) => (
              <div
                id={entry.id}
                className="formula-entry"
                data-textbook-position={entry.position}
                key={entry.id}
              >
                {entry.content}
              </div>
            ))}
          </div>
        </section>
      ))}
      {count === 0 && (
        <div className="reference-empty">
          <h2>没有匹配的公式</h2>
          <p>试试更短的名称或符号，也可以恢复全部章节。</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setChapter("all");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
