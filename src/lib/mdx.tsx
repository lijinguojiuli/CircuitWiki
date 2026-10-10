import fs from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { Formula, InlineFormula, FormulaCard } from "@/components/formula";
import { Callout, Warning, Tip, Example } from "@/components/ui";
import { CircuitDiagram } from "@/components/circuit-diagram";
import { Quiz } from "@/components/quiz";
import { RCCalculator, PhasorCalculator } from "@/components/calculators";
import type { Article } from "./content";
import type { MDXComponents } from "mdx/types";
import { SourceSymbolGuide } from "@/components/source-symbol-guide";
import { TopologyDiagram } from "@/components/topology-diagram";
import { StarDeltaDiagram } from "@/components/star-delta-diagram";
import { ThreePhaseDiagram } from "@/components/three-phase-diagram";
import { RCResponseDiagrams } from "@/components/rc-response-diagrams";
import {
  ControlledSourceGallery,
  ControlledTestDiagram,
} from "@/components/controlled-source-diagrams";
import { SourceTransformDiagram } from "@/components/source-transform-diagram";
import {
  SuperpositionDiagram,
  DividerPortDiagram,
} from "@/components/one-port-diagrams";
import { BridgePortLab } from "@/components/tools/bridge-port-lab";
import { CoupledInductorDiagram } from "@/components/coupled-inductor-diagram";
import {
  ResonanceDiagram,
  ParallelResonanceDiagram,
} from "@/components/resonance-diagram";
import { SinusoidalLab } from "@/components/sinusoidal-lab";
import { CompensationDiagram } from "@/components/compensation-diagram";
import { ThreePhaseSourceDiagram } from "@/components/three-phase-source-diagram";
import { SourceCombinationGuide } from "@/components/source-combination-guide";
import { PhasorConstruction } from "@/components/phasor-construction";
import { ThreePhaseLab } from "@/components/three-phase-lab";
const components: MDXComponents = {
  ParallelResonanceDiagram,
  SinusoidalLab,
  CompensationDiagram,
  ThreePhaseSourceDiagram,
  SourceCombinationGuide,
  PhasorConstruction,
  ThreePhaseLab,
  PhasorCalculator,
  Formula,
  InlineFormula,
  FormulaCard,
  SourceSymbolGuide,
  TopologyDiagram,
  StarDeltaDiagram,
  ThreePhaseDiagram,
  RCResponseDiagrams,
  ControlledSourceGallery,
  ControlledTestDiagram,
  SourceTransformDiagram,
  SuperpositionDiagram,
  DividerPortDiagram,
  BridgePortLab,
  CoupledInductorDiagram,
  ResonanceDiagram,
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
