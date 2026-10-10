"use client";
import { useEffect, useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { Button } from "./primitives";
import { recordReading, toggleBookmark, useStudy } from "@/lib/study-store";

export function BookmarkButton({ slug }: { slug: string }) {
  const { bookmarks } = useStudy();
  const saved = bookmarks.includes(slug);
  return (
    <Button
      className="bookmark-button"
      aria-pressed={saved}
      onClick={() => toggleBookmark(slug)}
    >
      {saved ? <Check size={15} /> : <Bookmark size={15} />}
      {saved ? "已收藏" : "收藏本页"}
    </Button>
  );
}
export function ReadingProgress({ slug }: { slug: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    let timer = 0;
    let furthest = 0;
    const update = () => {
      const prose = document.querySelector<HTMLElement>(".prose");
      if (!prose) return;
      const rect = prose.getBoundingClientRect();
      const value = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((110 - rect.top) / Math.max(1, rect.height - innerHeight + 110)) *
              100,
          ),
        ),
      );
      furthest = Math.max(furthest, value);
      setProgress(value);
      clearTimeout(timer);
      timer = window.setTimeout(() => recordReading(slug, furthest), 500);
    };
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      recordReading(slug, furthest);
    };
  }, [slug]);
  return (
    <div className="reading-progress">
      <span>阅读位置 {progress}%</span>
      <div
        role="progressbar"
        aria-label="本页阅读进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
