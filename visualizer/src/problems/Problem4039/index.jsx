import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DecodeSplitView from "./DecodeSplitView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "4039",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Encoded array JSON, e.g. [421]",
  url: "https://leetcode.com/problems/sum-of-decoded-numbers/",
  complexity: "O(n * log y) time and O(1) extra space: each value needs about log2(y) squaring steps, with BigInt arithmetic so products stay exact. The note's bounds (n up to 100000, values below 10^15, x and y below 10^9) are checked on parse; the visualization caps the array at 8 values.",
  examples: [
    { label: "One value", input: "[4831]" },
    { label: "Two values", input: "[52401, 9362]" },
  ],
};

export default function Problem4039Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DecodeSplitView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
