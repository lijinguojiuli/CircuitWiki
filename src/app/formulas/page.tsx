import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { formulas } from "@/lib/formulas";
import { FormulaCard } from "@/components/formula";
import { chapters, chapterLabel } from "@/lib/chapters";
import { FormulaSymbols } from "@/components/formula-symbols";
import { FormulaBrowser } from "@/components/formula-browser";
import { formulaId } from "@/lib/search";
const formulaChapters = chapters.filter((chapter) =>
  formulas.some((formula) => formula.position[0] === chapter.number),
);
export const metadata = pageMetadata(
  "公式速查",
  "按教材顺序查阅69条电路公式，搜索名称与符号，理解适用条件、参数单位和教材出处。",
  "/formulas",
  true,
);
export default function FormulasPage() {
  return (
    <main id="main" className="page-container platform-page reference-page">
      <div className="platform-kicker">解题时的参考手册</div>
      <h1>公式速查</h1>
      <p className="page-lead">
        找到公式，也读懂它的条件、符号与单位。点击公式可进入对应知识页，查看推导思路与使用示例。
      </p>
      <p className="book-reference">
        记号依据：《电路》第5版。小写 u、i、p 表示瞬时量；大写 U、I
        表示正弦有效值或已注明的直流恒定值。
      </p>
      <FormulaSymbols />
      <FormulaBrowser
        groups={formulaChapters.map((chapter) => ({
          number: chapter.number,
          title: chapterLabel(chapter),
          entries: formulas
            .filter((formula) => formula.position[0] === chapter.number)
            .map((f) => ({
              id: formulaId(f),
              position: f.position.join("-"),
              search: `${f.name} ${f.latex} ${f.parameters.join(" ")} ${f.name.includes("时间常数") ? "tau tao τ" : ""}`,
              content: (
                <>
                  <div className="formula-position">
                    §{f.position[0]}-{f.position[1]}
                    {f.supplemental ? " · 补充例题" : ""}
                  </div>
                  <FormulaCard {...f} href={`/learn/${f.slug}`} />
                  <Link className="formula-article" href={`/learn/${f.slug}`}>
                    理解公式 · 查看知识点 ↗
                  </Link>
                </>
              ),
            })),
        }))}
      />
    </main>
  );
}
