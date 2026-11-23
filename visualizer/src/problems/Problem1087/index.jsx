import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BraceExpansionView from "./BraceExpansionView";
import { code, python, parseInput, buildTrace, phases, inputLabel, complexity, examples } from "./algorithm.js";

const definition = {
  question: "Expand a string containing brace groups of options into every combination, sorted.",
  approaches: [
    { name: "Sequential product with sort", intuition: "Expand each group in turn, build the combinations, and sort the final list.", time: "O(k * n log k)", space: "O(k * n)" },
  ],
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
