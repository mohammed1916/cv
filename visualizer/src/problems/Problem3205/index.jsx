import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HopScoreView from "./HopScoreView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3205",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of non-negative integers (e.g. [4,1,6,2,5])",
  url: "https://leetcode.com/problems/maximum-array-hopping-score-i/",
  complexity: "O(n^2) time and O(n) space: each landing index tries every earlier index. The visualization caps the array at 10 values from 0 to 100.",
  examples: [
    { label: "Five values", input: "[4,1,6,2,5]" },
    { label: "Single index", input: "[7]" },
    { label: "Spike in the middle", input: "[0,9,0,3]" },
    { label: 'One value zero', input: '[0]' },
    { label: 'Equal values tie', input: '[5,5,5,5]' },
    { label: 'Extremes alternate', input: '[100,0,100,0,100,0,100,0,100,0]' },
    { label: 'Long run: 10 values', input: '[50,59,88,56,51,56,59,88,80,35]' },
  ],
};

export default function MaximumArrayHoppingScoreI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HopScoreView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
