"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function LegacyLessonRedirect({
  target,
  topics,
}: {
  target: string;
  topics: { slug: string; anchor: string }[];
}) {
  const router = useRouter();
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const match = topics.find((topic) => topic.anchor === id);
    const hash = match
      ? `#${match.anchor}`
      : /^section-[1-8]$/.test(id)
        ? `#${id}`
        : "";
    router.replace(`/learn/${match?.slug ?? target}${hash}`);
  }, [router, target, topics]);
  return (
    <main id="main" className="page-container platform-page">
      <h1>教材小节导航</h1>
      <p>正在打开对应的教材小节。</p>
      <Link href={`/learn/${target}`}>直接进入小节 →</Link>
      <Link className="tool-reading-link" href="/curriculum">
        查看逐节学习目录
      </Link>
    </main>
  );
}
