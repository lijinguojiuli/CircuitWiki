import { Formula } from "./formula";
import { WorkedStepFigure } from "./worked-step-figure";
import { workedSolutions } from "@/lib/challenges";
import type { WorkedStep } from "@/lib/challenges/types";

export function WorkedSolutionSteps({
  id,
  steps,
}: {
  id: string;
  steps: WorkedStep[];
}) {
  return (
    <>
      {steps.map((step, index) => (
        <section
          className="challenge-step"
          key={step.title}
          data-worked-step={index + 1}
        >
          <h4>
            {index + 1}. {step.title}
          </h4>
          {step.action && (
            <p className="worked-step-action">
              <strong>本步操作：</strong>
              {step.action}
            </p>
          )}
          {step.figure && (
            <WorkedStepFigure
              figure={step.figure}
              id={`${id}-step-${index + 1}`}
            />
          )}
          {step.reasoning && (
            <ol className="worked-step-reasoning">
              {step.reasoning.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
          )}
          <Formula latex={step.latex} />
          <p>{step.explanation}</p>
          {step.check && (
            <p className="worked-step-check">
              <strong>检查：</strong>
              {step.check}
            </p>
          )}
        </section>
      ))}
    </>
  );
}
export function WorkedExample({ id }: { id: string }) {
  const steps = workedSolutions[id];
  if (!steps) throw new Error(`Missing worked example: ${id}`);
  return (
    <div className="worked-example" data-worked-example={id}>
      <WorkedSolutionSteps id={id} steps={steps} />
    </div>
  );
}
