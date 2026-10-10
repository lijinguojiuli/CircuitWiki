import Link from "next/link";
import { formulas } from "@/lib/formulas";
import { FormulaCard } from "@/components/formula";
import { chapters, chapterLabel } from "@/lib/chapters";
import { FormulaSymbols } from "@/components/formula-symbols";
const formulaChapters = chapters.filter((chapter) =>
  formulas.some((formula) => formula.position[0] === chapter.number),
);
export const metadata = { title: "公式速查" };
export default function FormulasPage() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">常用公式</div>
      <h1>
        公式速查<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">
        按教材章号、节号与公式出现顺序排列，保留适用条件与参数单位。
      </p>
      <p className="book-reference">
        记号依据：《电路》第5版。小写 u、i、p 表示瞬时量；大写 U、I
        表示正弦有效值或已注明的直流恒定值。
      </p>
      <FormulaSymbols />
      <nav className="anchor-pills" aria-label="公式章节跳转">
        {formulaChapters.map((chapter) => (
          <a href={`#formula-chapter-${chapter.number}`} key={chapter.number}>
            第{chapter.number}章
          </a>
        ))}
      </nav>
      {formulaChapters.map((chapter) => (
        <section
          id={`formula-chapter-${chapter.number}`}
          className="formula-group"
          key={chapter.number}
        >
          <h2>{chapterLabel(chapter)}</h2>
          <div className="formula-grid">
            {formulas
              .filter((f) => f.position[0] === chapter.number)
              .map((f) => (
                <div key={f.name} data-textbook-position={f.position.join("-")}>
                  <div className="formula-position">
                    §{f.position[0]}-{f.position[1]}
                    {f.supplemental ? " · 补充例题" : ""}
                  </div>
                  <FormulaCard {...f} href={`/learn/${f.slug}`} />
                  <Link className="formula-article" href={`/learn/${f.slug}`}>
                    理解公式 · 查看知识点 ↗
                  </Link>
                </div>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
