"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { articles } from "@/lib/content";
import { useStudy, importStudy, toggleBookmark } from "@/lib/study-store";
import { parseStudyImport } from "@/lib/study-data";
import { Button, Card, Tag } from "./primitives";
import { StudyResume } from "./study-progress";

export function MyLearning() {
  const study = useStudy();
  const [tab, setTab] = useState<"bookmarks" | "history" | "completed">(
    "bookmarks",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const slugs =
    tab === "history" ? study.history.map((entry) => entry.slug) : study[tab];
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(study, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "circuitwiki-learning.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("学习记录已导出。可在其他浏览器导入这份文件。");
    setError("");
  };
  return (
    <>
      <StudyResume />
      <div className="learning-stats">
        <Card>
          <strong>{study.completed.length}</strong>
          <span>已学页面</span>
        </Card>
        <Card>
          <strong>{study.bookmarks.length}</strong>
          <span>收藏知识</span>
        </Card>
        <Card>
          <strong>{study.history.length}</strong>
          <span>阅读历史</span>
        </Card>
      </div>
      <div className="learning-tabs" aria-label="学习记录视图">
        {[
          { id: "bookmarks", label: "我的收藏" },
          { id: "history", label: "阅读历史" },
          { id: "completed", label: "已学习" },
        ].map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? "primary" : "ghost"}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id as typeof tab)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="personal-list">
        {slugs.length ? (
          slugs.map((slug) => {
            const article = articles.find((item) => item.slug === slug)!;
            const history = study.history.find((item) => item.slug === slug);
            return (
              <div className="personal-row" key={slug}>
                <Link href={`/learn/${slug}`}>
                  <h2>{article.title}</h2>
                  <p>{article.description}</p>
                  {tab === "history" && history && (
                    <small>
                      最近阅读{" "}
                      {new Intl.DateTimeFormat("zh-CN").format(
                        new Date(history.visitedAt),
                      )}{" "}
                      · 最远阅读 {history.progress}%
                    </small>
                  )}
                </Link>
                {study.completed.includes(slug) && (
                  <Tag tone="muted">已学习</Tag>
                )}
                {tab === "bookmarks" && (
                  <Button
                    variant="ghost"
                    aria-label={`取消收藏 ${article.title}`}
                    onClick={() => toggleBookmark(slug)}
                  >
                    取消收藏
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <Card className="learning-empty">
            <h2>
              {tab === "bookmarks"
                ? "把值得回顾的知识留在这里"
                : tab === "history"
                  ? "从一次阅读开始积累"
                  : "记录你完成的每一步"}
            </h2>
            <p>
              {tab === "bookmarks"
                ? "在知识页点击“收藏本页”，即可随时回顾。"
                : tab === "history"
                  ? "阅读过的知识页会自动出现在这里。"
                  : "完成例题并理解概念后，在知识页标记已学习。"}
            </p>
            <Link href="/knowledge">探索知识体系 →</Link>
          </Card>
        )}
      </div>
      <Card className="learning-backup">
        <div>
          <h2>你的学习记录，由你保存</h2>
          <p>
            当前记录只保存在本浏览器。清理浏览器数据会清除记录；导出文件可用于备份和迁移。导入会合并收藏与已学列表，不清空现有记录。
          </p>
        </div>
        <div className="workspace-actions">
          <Button onClick={exportData}>导出学习记录</Button>
          <Button onClick={() => input.current?.click()}>导入学习记录</Button>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            aria-label="选择学习记录文件"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 1_000_000)
                  throw new Error(
                    "文件过大，请选择 CircuitWiki 导出的学习记录。",
                  );
                importStudy(parseStudyImport(await file.text()));
                setMessage("学习记录已合并导入。");
                setError("");
              } catch (reason) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "导入失败，请检查文件。",
                );
                setMessage("");
              }
              event.target.value = "";
            }}
          />
        </div>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </Card>
    </>
  );
}
