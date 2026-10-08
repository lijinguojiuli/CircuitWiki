import fs from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { Formula, InlineFormula, FormulaCard } from "@/components/formula";
import { Callout, Warning, Tip, Example } from "@/components/ui";
import { CircuitDiagram } from "@/components/circuit-diagram";
import { Quiz } from "@/components/quiz";
import { RCCalculator } from "@/components/calculators";
import type { Article } from "./content";
import type { MDXComponents } from "mdx/types";
import { SourceSymbolGuide } from "@/components/source-symbol-guide";
const components: MDXComponents = {
  Formula,
  InlineFormula,
  FormulaCard,
  SourceSymbolGuide,
  Callout,
  Warning,
  Tip,
  Example,
  CircuitDiagram,
  Quiz,
  RCCalculator,
  h2: ({ children, ...props }) => {
    const number = String(children).match(/^([1-8])/);
    return (
      <h2 id={number ? `section-${number[1]}` : undefined} {...props}>
        {children}
      </h2>
    );
  },
};
export async function ArticleBody({ article }: { article: Article }) {
  const source = await fs.readFile(
    path.join(process.cwd(), "content", article.folder, `${article.slug}.mdx`),
    "utf8",
  );
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  });
  return <Content components={components} />;
}
