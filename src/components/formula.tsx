import katex from "katex";
import Link from "next/link";
export function Formula({
  latex,
  children,
  description,
}: {
  latex?: string;
  children?: string;
  description?: string;
}) {
  return (
    <figure className="formula">
      <div
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(latex ?? children ?? "", {
            displayMode: true,
            throwOnError: true,
            strict: "error",
          }),
        }}
      />
      {description && <figcaption>{description}</figcaption>}
    </figure>
  );
}
export function InlineFormula({ latex }: { latex: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(latex, { throwOnError: true }),
      }}
    />
  );
}
export function FormulaCard({
  name,
  latex,
  condition,
  parameters,
  href,
  source,
}: {
  name: string;
  latex: string;
  condition: string;
  parameters: string[];
  href?: string;
  source?: string;
}) {
  return (
    <div className="formula-card">
      <h3>{name}</h3>
      {href ? (
        <Link href={href} aria-label={`${name}：查看知识点`}>
          <Formula latex={latex} />
        </Link>
      ) : (
        <Formula latex={latex} />
      )}
      <p className="muted">{condition}</p>
      {source && <p className="book-reference">{source}</p>}
      <details>
        <summary>符号含义与单位</summary>
        <ul>
          {parameters.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
