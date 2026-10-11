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
  const [source, setSource] = useState("textbook");
  const [difficulty, setDifficulty] = useState("");
  const entries = problems.filter(
    (problem) =>
      (!chapter || String(problem.chapter) === chapter) &&
      (!difficulty || problem.difficulty === difficulty) &&
      (!source || (problem.sourceKind ?? "original") === source),
  );
  return (
    <>
      <div className="workspace-toolbar practice-toolbar">
        <label>
          题目来源
          <select
            aria-label="题目来源"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option value="textbook">教材选题</option>
            <option value="original">本站原创</option>
            <option value="">全部来源</option>
          </select>
        </label>
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
            <option value="">全部题型</option>
            <option>教材习题</option>
            <option>教材例题</option>
            <option>教材图解练习</option>
            <option>综合提高</option>
            <option>综合挑战</option>
          </select>
        </label>
        <Button
          variant="ghost"
          onClick={() => {
            setChapter("");
            setDifficulty("");
            setSource("");
          }}
        >
          清除筛选
        </Button>
      </div>
      <p className="search-count" role="status">
        显示 {entries.length} / {problems.length} 道题 · 教材选题与原创练习
      </p>
      <div className="practice-grid">
        {entries.map((problem) => (
          <Link
            className="practice-card"
            key={problem.id}
            href={`/learn/${problem.slug}#challenge-${problem.id}`}
          >
            <div>
              <span className="platform-kicker">
                {problem.exercise
                  ? (problem.reference ?? `习题${problem.exercise}`)
                  : `§${problem.chapter}-${problem.section}`}
              </span>
              <Tag tone="muted">{problem.difficulty}</Tag>
              {problem.secondary && <Tag tone="muted">非重点</Tag>}
            </div>
            <h2>{problem.title}</h2>
            <span>
              {problem.pages
                ? `第5版 · 书页${problem.pages} · 看图解题 →`
                : "阅读题目 · 提示 · 分步解答 →"}
            </span>
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
