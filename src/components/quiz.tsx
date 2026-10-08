"use client";
import { useState } from "react";
export function Quiz({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  return (
    <div className="quiz">
      <span className="eyebrow">练习</span>
      <h3>{question}</h3>
      <div className="quiz-options">
        {options.map((option, i) => (
          <button
            aria-pressed={chosen === i}
            className={chosen === i ? "selected" : ""}
            key={option}
            onClick={() => setChosen(i)}
          >
            {option}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <p role="status">
          {chosen === answer ? "✓ 回答正确。" : "再想一想。"}
          {explanation}
        </p>
      )}
    </div>
  );
}
