import Link from "next/link";
import { formulas } from "@/lib/formulas";
import { FormulaCard } from "@/components/formula";
const formulaCategories = [...new Set(formulas.map((f) => f.category))];
export const metadata = { title: "公式速查" };
export default function FormulasPage() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">常用公式</div>
      <h1>
        公式速查<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">把常用公式放在手边，也把适用条件放在心里。</p>
      <p className="book-reference">
        记号依据：《电路》第5版。小写 u、i、p 表示瞬时量；大写 U、I
        表示正弦有效值或已注明的直流恒定值。
      </p>
      <nav className="anchor-pills">
        {formulaCategories.map((c) => (
          <a href={`#${c}`} key={c}>
            {c}
          </a>
        ))}
      </nav>
      {formulaCategories.map((c) => (
        <section id={c} className="formula-group" key={c}>
          <h2>{c}</h2>
          <div className="formula-grid">
            {formulas
              .filter((f) => f.category === c)
              .map((f) => (
                <div key={f.name}>
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
