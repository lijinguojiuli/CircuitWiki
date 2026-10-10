"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TableOfContents({ items }: { items: string[] }) {
  const [active, setActive] = useState(1);
  const pathname = usePathname();
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const headings = [
        ...document.querySelectorAll<HTMLElement>('.prose h2[id^="section-"]'),
      ];
      const current = headings
        .filter((heading) => heading.getBoundingClientRect().top <= 160)
        .at(-1);
      setActive(current ? Number(current.id.replace("section-", "")) : 1);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return (
    <nav className="toc" aria-label="本页目录">
      <p className="eyebrow">阅读导航</p>
      <strong>本页目录</strong>
      {items.map((item, index) => (
        <a
          key={item}
          href={`#section-${index + 1}`}
          aria-current={active === index + 1 ? "location" : undefined}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {item}
        </a>
      ))}
    </nav>
  );
}
