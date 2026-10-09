"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Search as SearchIcon,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { articles, articleHref } from "@/lib/content";
import { chapterForArticle, chapterLabel } from "@/lib/chapters";
import { MobileDirectory } from "./sidebar-panel";
import { formulas } from "@/lib/formulas";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" aria-label="外观模式">
      {[
        { id: "light", label: "Light 浅色", Icon: Sun },
        { id: "dark", label: "Dark 深色", Icon: Moon },
        { id: "system", label: "System 跟随系统", Icon: Monitor },
      ].map(({ id, label, Icon }) => (
        <button
          key={id}
          title={label}
          aria-label={label}
          onClick={() => setTheme(id)}
          data-theme-choice={id}
          className={theme === id ? "active" : ""}
          suppressHydrationWarning
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
export function Search() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const matches = articles.filter((a) =>
    `${a.title} ${a.keywords.join(" ")} ${formulas
      .filter((f) => f.slug === a.slug)
      .map((f) => f.name)
      .join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        input.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  return (
    <div
      className="search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <SearchIcon size={17} />
      <input
        ref={input}
        aria-label="搜索知识点和公式"
        placeholder="搜索知识点、公式…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      <kbd>Ctrl K</kbd>
      {open && (
        <div className="search-results">
          <div className="eyebrow">{query ? "搜索结果" : "快速跳转"}</div>
          {matches.slice(0, 8).map((a) => (
            <Link
              onClick={() => {
                setOpen(false);
                input.current?.blur();
              }}
              key={a.slug}
              href={articleHref(a.slug)}
            >
              <BookOpen size={16} />
              <span>
                {a.title}
                <small>{chapterLabel(chapterForArticle(a.slug))}</small>
              </span>
              <ArrowUpRight size={14} />
            </Link>
          ))}
          {matches.length === 0 && <p>未找到结果，试试“电容”或“相量”。</p>}
        </div>
      )}
    </div>
  );
}
export function Header() {
  const [menu, setMenu] = useState(false);
  const path = usePathname();
  return (
    <>
      <header className="header">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Zap size={21} />
          </span>
          Circuit<span>Wiki</span>
          <small>BETA</small>
        </Link>
        <div className="desktop-nav">
          <Link
            className={
              path.startsWith("/learn") || path === "/curriculum"
                ? "active"
                : ""
            }
            href="/curriculum"
          >
            知识库
          </Link>
          <Link
            className={path === "/formulas" ? "active" : ""}
            href="/formulas"
          >
            公式速查
          </Link>
          <Link className={path === "/tools" ? "active" : ""} href="/tools">
            电路工具
          </Link>
        </div>
        <Search />
        <ThemeToggle />
        <button
          className="menu-button"
          aria-label={menu ? "关闭目录" : "打开目录"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      {menu && <MobileDirectory onNavigate={() => setMenu(false)} />}
    </>
  );
}
