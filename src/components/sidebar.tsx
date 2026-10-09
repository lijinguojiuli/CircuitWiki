"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Zap } from "lucide-react";
import { articles, articleHref } from "@/lib/content";
import { chapters } from "@/lib/chapters";

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
      {chapters.map((chapter) => (
        <div
          className={`nav-group${chapter.skipped ? " nav-group-skipped" : ""}`}
          key={chapter.number}
          data-chapter={chapter.number}
        >
          <h3>
            <span>{String(chapter.number).padStart(2, "0")}</span>
            {chapter.title}
          </h3>
          {chapter.skipped ? (
            <p className="nav-scope">跳过本章</p>
          ) : (
            <>
              {chapter.number === 11 && <p className="nav-scope">仅学习谐振</p>}
              {chapter.slugs.map((slug) => {
                const article = articles.find((item) => item.slug === slug)!;
                return (
                  <Link
                    key={slug}
                    href={articleHref(slug)}
                    aria-current={
                      path === articleHref(slug) ? "page" : undefined
                    }
                    className={path === articleHref(slug) ? "current" : ""}
                    onClick={onNavigate}
                  >
                    {article.title}
                    {article.core && <span className="core-dot" />}
                  </Link>
                );
              })}
            </>
          )}
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
