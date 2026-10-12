import Link from "next/link";
import { Formula } from "./formula";
import { Tag } from "./primitives";
import { WorkedSolutionSteps } from "./worked-solution-steps";
import { getChallenge, textbookSourceReference } from "@/lib/challenges";
import {
  ProblemSchematic,
  ProblemPhasorDiagram,
  ProblemAbstractGraph,
} from "./problem-diagrams";
export function ChallengeProblem({ id }: { id: string }) {
  const problem = getChallenge(id);
  const graph = problem.checks.find((check) => check.kind === "graph");
  return (
    <section
      id={`challenge-${id}`}
      className="challenge-problem"
      aria-label={
        problem.source
          ? textbookSourceReference(problem.source)
          : `§${id}提高题`
      }
      data-challenge-id={id}
      data-problem-source={problem.source ? "textbook" : "original"}
    >
      <div className="challenge-heading">
        <div>
          <span className="platform-kicker">
            {problem.source
              ? `教材第5版 · ${textbookSourceReference(problem.source)} · 书页${problem.source.pages}`
              : `§${id} · 本站原创`}
          </span>
          <h3>{problem.title}</h3>
        </div>
        <Tag>{problem.difficulty}</Tag>
        {problem.secondary && <Tag tone="muted">非重点</Tag>}
      </div>
      <div className="challenge-given">
        <strong>题目条件</strong>
        <p>{problem.given}</p>
      </div>
      {problem.network && (
        <ProblemSchematic network={problem.network} title={problem.title} />
      )}
      {problem.networks?.map((item) => (
        <div key={item.title}>
          <h4>{item.title}</h4>
          <ProblemSchematic network={item.network} title={item.title} />
        </div>
      ))}
      {graph && <ProblemAbstractGraph check={graph} id={id} />}
      <ol className="challenge-tasks">
        {problem.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ol>
      <details className="challenge-hints">
        <summary>需要思路时，展开提示</summary>
        <ul>
          {problem.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </details>
      <details className="challenge-solution">
        <summary>完成尝试后，查看分步解答与校验</summary>
        <div>
          <WorkedSolutionSteps id={id} steps={problem.steps} />
          {problem.phasors && (
            <div className="problem-phasor-grid">
              {problem.phasors.map((group, index) => (
                <ProblemPhasorDiagram
                  key={group.caption}
                  group={group}
                  id={`${id}-${index}`}
                />
              ))}
            </div>
          )}
          <div className="challenge-answer">
            <strong>最终结果</strong>
            <Formula latex={problem.answer} />
          </div>
          {problem.takeaway && (
            <aside className="textbook-takeaway">
              <strong>这一题的关键判断</strong>
              <p>{problem.takeaway}</p>
            </aside>
          )}
          <p className="challenge-check-note">
            本题数值已用独立方程残差、功率/能量关系或响应公式核验。请同时核对题设的单位、方向和适用条件。
          </p>
        </div>
      </details>
      <p className="challenge-source">
        {problem.source
          ? `来源：邱关源、罗先觉《电路》第5版，${textbookSourceReference(problem.source)}，书页${problem.source.pages}。${problem.source.note}`
          : `知识范围依据邱关源《电路》第5版 §${id}；题干、数值和解答为本站原创，并非教材原题或考试真题。`}
        <Link href="/practice">浏览全部提高题 →</Link>
      </p>
    </section>
  );
}
