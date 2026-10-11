"use client";
import Link from "next/link";
import { useState } from "react";
import type { ChallengeIndexEntry } from "@/lib/challenges/catalogue";
import { Tag, Button } from "./primitives";
export function PracticeCatalogue({
  problems,
  chapters,
}: {
  problems: ChallengeIndexEntry[];
  chapters: { number: number; title: string }[];
}) {
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const entries = problems.filter(
    (problem) =>
      (!chapter || String(problem.chapter) === chapter) &&
      (!difficulty || problem.difficulty === difficulty),
  );
  return (
    <>
      <div className="workspace-toolbar practice-toolbar">
        <label>
          练习章节
          <select
            aria-label="练习章节"
            value={chapter}
            onChange={(event) => setChapter(event.target.value)}
          >
            <option value="">全部章节</option>
            {chapters.map((item) => (
              <option key={item.number} value={item.number}>
                第{item.number}章 · {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          题目类型
          <select
            aria-label="题目类型"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="">全部提高题</option>
            <option>综合提高</option>
            <option>综合挑战</option>
          </select>
        </label>
        <Button
          variant="ghost"
          onClick={() => {
            setChapter("");
            setDifficulty("");
          }}
        >
          清除筛选
        </Button>
      </div>
      <p className="search-count" role="status">
        显示 {entries.length} / {problems.length} 道提高题 · 每个教材小节一题
      </p>
      <div className="practice-grid">
        {entries.map((problem) => (
          <Link
            className="practice-card"
            key={problem.id}
            href={`/learn/${problem.slug}#challenge-${problem.id}`}
          >
            <div>
              <span className="platform-kicker">§{problem.id}</span>
              <Tag tone="muted">{problem.difficulty}</Tag>
              {problem.secondary && <Tag tone="muted">非重点</Tag>}
            </div>
            <h2>{problem.title}</h2>
            <span>阅读题目 · 提示 · 分步解答 →</span>
          </Link>
        ))}
      </div>
      {entries.length === 0 && (
        <p className="learning-empty">
          当前筛选没有题目，清除筛选后可查看全部内容。
        </p>
      )}
    </>
  );
}
