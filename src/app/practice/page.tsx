import { pageMetadata } from "@/lib/seo";
import { challengeIndex } from "@/lib/challenges/catalogue";
import { learningChapters } from "@/lib/chapters";
import { PracticeCatalogue } from "@/components/practice-catalogue";
export const metadata = pageMetadata(
  "综合提高题",
  "53个教材小节，每节一题。通过多条件分析、提示、分步解答和数值校验训练电路解题能力。",
  "/practice",
);
export default function PracticePage() {
  return (
    <main id="main" className="page-container platform-page">
      <span className="platform-kicker">从理解概念，到独立解题</span>
      <h1>综合提高题</h1>
      <p className="platform-lead">
        53
        个教材小节，每节都有多问综合题。先按题干独立尝试，遇到卡点再展开提示，最后用完整解答检查方法、方向和结果。
      </p>
      <PracticeCatalogue
        problems={challengeIndex}
        chapters={learningChapters.map(({ number, title }) => ({
          number,
          title,
        }))}
      />
      <details className="practice-references">
        <summary>公开课程题型参考与来源说明</summary>
        <p>
          本站题干、数值和解答为原创。可另外阅读下列公开原题，比较多结点方程、端口互联及含受控源输入电阻的解题组织；这些原题不计入本站53题。
        </p>
        <ul>
          <li>
            <a
              href="https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/15878f74dcca61c4298c957999778bc0_hw2.pdf"
              target="_blank"
              rel="noreferrer"
            >
              MIT 6.002 Homework 2：多结点与含源端口练习 ↗
            </a>
          </li>
          <li>
            <a
              href="https://www.ocw.mit.edu/courses/6-301-solid-state-circuits-fall-2010/e48c1f9b07de7925b7864952954f0ff3_MIT6_301F10_assn01.pdf"
              target="_blank"
              rel="noreferrer"
            >
              MIT 6.301 Problem Set 1，第3题：含受控源输入电阻 ↗
            </a>
          </li>
        </ul>
      </details>
    </main>
  );
}
