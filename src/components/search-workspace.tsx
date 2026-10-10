"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { searchContent } from "@/lib/search";
import { knowledgeAreas } from "@/lib/knowledge";
import { Button, Card, Tag } from "./primitives";
export function SearchWorkspace() {
  const initialQuery = useSearchParams().get("q") ?? "";
  return <SearchResults key={initialQuery} initialQuery={initialQuery} />;
}
function SearchResults({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState("");
  const [area, setArea] = useState("");
  const [limit, setLimit] = useState(24);
  const router = useRouter();
  const results = searchContent(query, Infinity, { kind, area });
  return (
    <div className="full-search">
      <form
        className="full-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          router.replace(`/search?q=${encodeURIComponent(query)}`);
        }}
      >
        <label htmlFor="knowledge-search">知识点、公式名称或符号</label>
        <div>
          <input
            id="knowledge-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(24);
            }}
            placeholder="例如：节点电压法、Req、RC 时间常数"
          />
          <Button variant="primary" type="submit">
            搜索
          </Button>
        </div>
      </form>
      <div className="workspace-toolbar">
        <label>
          内容类型
          <select
            aria-label="内容类型"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setLimit(24);
            }}
          >
            <option value="">全部类型</option>
            {[
              "知识专题",
              "章节全览",
              "综合例题",
              "教材小节",
              "公式",
              "交互工具",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          知识分类
          <select
            aria-label="知识分类"
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              setLimit(24);
            }}
          >
            <option value="">全部分类</option>
            {knowledgeAreas.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="ghost"
          onClick={() => {
            setQuery("");
            setKind("");
            setArea("");
            setLimit(24);
          }}
        >
          清除筛选
        </Button>
      </div>
      <p className="search-count" role="status">
        找到 {results.length} 项内容
        {results.length > limit ? ` · 显示前 ${limit} 项` : ""}
      </p>
      <div className="search-result-list">
        {results.slice(0, limit).map((result) => {
          const ResultLink = result.kind === "公式" ? "a" : Link;
          return (
            <ResultLink key={result.id} href={result.href}>
              <Tag tone="muted">{result.kind}</Tag>
              <div>
                <h2>{result.title}</h2>
                <p>{result.detail}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </ResultLink>
          );
        })}
      </div>
      {results.length === 0 && (
        <Card className="learning-empty">
          <h2>暂时没有匹配内容</h2>
          <p>试试更短的关键词、其他符号，或清除分类限制。</p>
        </Card>
      )}
      {results.length > limit && (
        <Button onClick={() => setLimit(limit + 24)}>显示更多结果</Button>
      )}
    </div>
  );
}
