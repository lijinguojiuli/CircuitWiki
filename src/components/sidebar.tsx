"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Zap } from "lucide-react";
import { articles, articleHref } from "@/lib/content";
import { learningChapters, lessonSectionLabel } from "@/lib/chapters";
import { CompletionMark } from "./study-progress";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="sidebar-nav" aria-label="知识目录">
      <Link
        className={
          path === "/curriculum" ? "nav-overview current" : "nav-overview"
        }
        href="/curriculum"
        onClick={onNavigate}
      >
        <BookOpen size={17} />
        学习路线<span>{articles.length}</span>
      </Link>
      {learningChapters.map((chapter) => (
        <div
          className="nav-group"
          key={chapter.number}
          data-chapter={chapter.number}
        >
          <h3>
            <span>{String(chapter.number).padStart(2, "0")}</span>
            {chapter.title}
          </h3>
          {chapter.slugs.map((slug) => {
            const article = articles.find((item) => item.slug === slug)!;
            return (
              <Link
                key={slug}
                href={articleHref(slug)}
                aria-current={path === articleHref(slug) ? "page" : undefined}
                className={path === articleHref(slug) ? "current" : ""}
                onClick={onNavigate}
                data-textbook-section={lessonSectionLabel(slug)}
              >
                <span>
                  <small className="nav-section" aria-hidden="true">
                    {lessonSectionLabel(slug)}
                  </small>
                  {article.title}
                  {article.secondaryTopics && (
                    <small className="nav-secondary" aria-hidden="true">
                      {article.secondaryTopics.join("、")} · 非重点
                    </small>
                  )}
                </span>
                <CompletionMark slug={slug} />
              </Link>
            );
          })}
        </div>
      ))}
      <div className="sidebar-note">
        <Zap size={18} />
        <strong>把公式变成直觉</strong>
        <p>调整参数，观察电路的变化。</p>
        <Link href="/tools" onClick={onNavigate}>
          打开电路工具 →
        </Link>
      </div>
    </nav>
  );
}
