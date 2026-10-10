"use client";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

function useDirectoryScroll<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    // Restore only on mount. Route changes must not recenter the selected link.
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(key);
    } catch {
      /* Storage may be disabled. */
    }
    if (saved !== null && Number.isFinite(Number(saved))) {
      panel.scrollTop = Number(saved);
    } else {
      const current = panel.querySelector('[aria-current="page"]');
      if (current) {
        const bounds = panel.getBoundingClientRect();
        const target = current.getBoundingClientRect();
        if (target.bottom > bounds.bottom || target.top < bounds.top)
          panel.scrollTop += target.top - bounds.top - 80;
      }
    }
  }, [key]);
  const remember = () => {
    if (!ref.current) return;
    try {
      sessionStorage.setItem(key, String(ref.current.scrollTop));
    } catch {
      /* Keep navigation usable without storage. */
    }
  };
  return { ref, remember };
}

export function DesktopSidebar() {
  const { ref, remember } = useDirectoryScroll<HTMLElement>(
    "circuitwiki:desktop-directory-scroll",
  );
  return (
    <aside className="left-sidebar" ref={ref} onScroll={remember}>
      <Sidebar onNavigate={remember} />
    </aside>
  );
}

export function MobileDirectory({ onNavigate }: { onNavigate: () => void }) {
  const { ref, remember } = useDirectoryScroll<HTMLDivElement>(
    "circuitwiki:mobile-directory-scroll",
  );
  const navigate = () => {
    remember();
    onNavigate();
  };
  return (
    <div className="mobile-menu" ref={ref} onScroll={remember}>
      <div className="mobile-top-links">
        <Link href="/formulas" onClick={navigate}>
          公式速查
        </Link>
        <Link href="/tools" onClick={navigate}>
          电路工具
        </Link>
      </div>
      <div className="mobile-settings">
        <span>外观</span>
        <ThemeToggle />
      </div>
      <Sidebar onNavigate={navigate} />
    </div>
  );
}
