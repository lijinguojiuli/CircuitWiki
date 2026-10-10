"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import {
  Search as SearchIcon,
  Menu,
  X,
  BookOpen,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { MobileDirectory } from "./sidebar-panel";
import { searchContent } from "@/lib/search";
import { ThemeToggle } from "./theme-toggle";
export function Search() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const matches = searchContent(query);
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
        placeholder="搜索知识、公式、工具…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            results.current?.querySelector<HTMLAnchorElement>("a")?.focus();
          }
          if (e.key === "Enter" && open)
            results.current?.querySelector<HTMLAnchorElement>("a")?.click();
        }}
      />
      <kbd>Ctrl K</kbd>
      {open && (
        <div
          className="search-results"
          ref={results}
          onKeyDown={(e) => {
            if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
            e.preventDefault();
            const links = [
              ...e.currentTarget.querySelectorAll<HTMLAnchorElement>("a"),
            ];
            const index = links.indexOf(
              document.activeElement as HTMLAnchorElement,
            );
            const next = index + (e.key === "ArrowDown" ? 1 : -1);
            if (next < 0) input.current?.focus();
            else links[Math.min(next, links.length - 1)]?.focus();
          }}
        >
          <div className="eyebrow">{query ? "搜索结果" : "快速跳转"}</div>
          {matches.map((result) => {
            // Native fragment navigation reveals a formula hidden by filters.
            const ResultLink = result.kind === "公式" ? "a" : Link;
            return (
              <ResultLink
                onClick={() => {
                  // Restore filtered cards before the browser resolves the fragment.
                  if (
                    result.kind === "公式" &&
                    window.location.pathname === "/formulas"
                  ) {
                    flushSync(() =>
                      window.dispatchEvent(
                        new Event("circuitwiki:reveal-formula"),
                      ),
                    );
                  }
                  setOpen(false);
                  input.current?.blur();
                }}
                key={result.id}
                href={result.href}
              >
                <BookOpen size={16} />
                <span>
                  <span className="search-result-kind">{result.kind}</span>
                  <strong>{result.title}</strong>
                  <small>{result.detail}</small>
                </span>
                <ArrowUpRight size={14} />
              </ResultLink>
            );
          })}
          {matches.length === 0 && <p>未找到结果，试试“电容”或“相量”。</p>}
          <div className="search-hint">
            ↑ ↓ 选择 <span>Enter 打开 · Esc 关闭</span>
          </div>
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
            学习路线
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
