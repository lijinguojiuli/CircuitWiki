import { pageMetadata } from "@/lib/seo";
import {
  challengeIndex,
  textbookGroupCount,
  originalGroupCount,
} from "@/lib/challenges/catalogue";
import { learningChapters } from "@/lib/chapters";
import { PracticeCatalogue } from "@/components/practice-catalogue";
export const metadata = pageMetadata(
  "教材习题与提高练习",
  `53个教材小节均有教材来源配套题；${textbookGroupCount}组教材习题、例题及图解练习与${originalGroupCount}道原创题分类展示。`,
  "/practice",
);
export default function PracticePage() {
  return (
    <main id="main" className="page-container platform-page">
      <span className="platform-kicker">从理解概念，到独立解题</span>
      <h1>教材习题与提高练习</h1>
      <p className="platform-lead">
        先按本节知识完成教材习题、例题或图解练习，再用原创题检验迁移。每题保留电路连接、参考方向和关键解题步骤，教材题号与书页可以回查。
      </p>
      <p className="muted">
        53节全部配题 · {textbookGroupCount}组教材来源练习 · {originalGroupCount}
        道原创题
      </p>
      <PracticeCatalogue
        problems={challengeIndex}
        chapters={learningChapters.map(({ number, title }) => ({
          number,
          title,
        }))}
      />
      <details className="practice-references">
        <summary>教材、配套课程与其他练习来源</summary>
        <p>
          教材内容分为章末习题、书中例题、依据书中图整理的练习，分别标明题号、例号或图号。连接与参数依据用户提供的第5版，图形重绘、本站解答另行推导；标注“本站原创”的53题保持独立来源。配套课程可用于延伸学习，本站节号仍按教材排列。
        </p>
        <ul>
          <li>
            <a
              href="https://icc.hep.com.cn/xjtu/dl"
              target="_blank"
              rel="noreferrer"
            >
              高等教育出版社《电路》第5版配套数字课程：电子教案、重点难点及习题入口
              ↗
            </a>
          </li>
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
