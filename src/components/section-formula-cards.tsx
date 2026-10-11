import { formulas } from "@/lib/formulas";
import { FormulaCard } from "./formula";
export function SectionFormulaCards({
  chapter,
  section,
}: {
  chapter: number;
  section: number;
}) {
  const entries = formulas.filter(
    (formula) =>
      formula.position[0] === chapter && formula.position[1] === section,
  );
  return (
    <div className="section-formula-cards">
      {entries.map((formula) => (
        <FormulaCard {...formula} key={formula.name} />
      ))}
    </div>
  );
}
