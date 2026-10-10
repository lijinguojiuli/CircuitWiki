"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BookOpen, Check, CircleCheck } from "lucide-react";
import { articles } from "@/lib/content";
import { chapterForArticle } from "@/lib/chapters";
import { recordVisit, toggleCompleted, useStudy } from "@/lib/study-store";

export function StudyResume() {
  const { completed, lastSlug } = useStudy();
  const last = articles.find((article) => article.slug === lastSlug);
  const lastIndex = articles.findIndex((article) => article.slug === lastSlug);
  const next =
    last && completed.includes(last.slug)
      ? articles
          .slice(lastIndex + 1)
          .find((article) => !completed.includes(article.slug))
      : undefined;
  const target = next ?? last ?? articles[0];
  const done = completed.length === articles.length;
  return (
    <section className="study-resume" aria-label="我的学习">
      <div className="study-resume-icon">
        <BookOpen size={21} />
      </div>
      <div className="study-resume-copy">
        <span className="platform-kicker">
          {done
            ? "已完成全部学习页"
            : last
              ? "接着上次学"
              : "第一次来到 CircuitWiki？"}
        </span>
        <h2>
          {done
            ? "回顾知识，巩固理解"
            : last
              ? target.title
              : "从第 1 章开始，建立电路分析的基础"}
        </h2>
        <p>
          {last
            ? `第 ${chapterForArticle(target.slug).number} 章 · 学习记录保存在当前浏览器`
            : "先读章节全览，再深入专题；用例题和交互实验检查理解。"}
        </p>
      </div>
      <div className="study-resume-action">
        <span>
          {completed.length} / {articles.length} 篇已完成
        </span>
        <Link className="button primary" href={`/learn/${target.slug}`}>
          {last ? "继续学习" : "开始学习"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export function ChapterProgress({ slugs }: { slugs: readonly string[] }) {
  const { completed } = useStudy();
  const count = slugs.filter((slug) => completed.includes(slug)).length;
  return (
    <span
      className="chapter-progress"
      aria-label={`本章已完成 ${count} / ${slugs.length} 篇`}
    >
      <span className="chapter-progress-track">
        <span style={{ width: `${(count / slugs.length) * 100}%` }} />
      </span>
      {count} / {slugs.length}
    </span>
  );
}

export function CompletionMark({ slug }: { slug: string }) {
  const { completed } = useStudy();
  return completed.includes(slug) ? (
    <Check size={14} className="lesson-complete" aria-label="已完成" />
  ) : null;
}

export function LessonProgress({ slug }: { slug: string }) {
  const { completed } = useStudy();
  const done = completed.includes(slug);
  useEffect(() => recordVisit(slug), [slug]);
  return (
    <section className="lesson-finish" aria-label="本页学习记录">
      <div>
        <CircleCheck size={22} />
        <div>
          <h2>{done ? "已完成本页学习" : "学完这一页了吗？"}</h2>
          <p>理解概念、核对例题后，记录本次学习进度。仅保存在本机。</p>
        </div>
      </div>
      <button
        className={`button ${done ? "secondary" : "primary"}`}
        aria-pressed={done}
        onClick={() => toggleCompleted(slug)}
      >
        {done ? <Check size={16} /> : <CircleCheck size={16} />}
        {done ? "已完成 · 撤销标记" : "标记为已完成"}
      </button>
    </section>
  );
}
