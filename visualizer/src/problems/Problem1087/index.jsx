import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BraceExpansionView from "./BraceExpansionView";
import { code, python, parseInput, buildTrace, phases, inputLabel, complexity, examples } from "./algorithm.js";

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel,
  url: "https://leetcode.com/problems/brace-expansion/",
  complexity,
  examples,
};

export default function Problem1087Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BraceExpansionView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>Each group offers its letters in sorted order, so walking the groups left to right produces the results already sorted.</p>
        </>
      )}
    />
  );
}
