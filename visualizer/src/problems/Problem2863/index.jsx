import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SemiDecreasingView from "./SemiDecreasingView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2863",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Array JSON, e.g. [2,4,1,3]",
  url: "https://leetcode.com/problems/maximum-length-of-semi-decreasing-subarrays/",
  complexity: "O(n^2) time and O(1) extra space in the trace, which scans each left end's right ends until the first smaller value. The draft's bound on n is unverified, so the visualization caps the array at 20 values.",
  examples: [
    { label: "[2,4,1,3] gives 3", input: "[2,4,1,3]" },
    { label: "[7,6,1,5] gives 4", input: "[7,6,1,5]" },
    { label: "[1,2,3,4] gives 0", input: "[1,2,3,4]" },
  ],
};

export default function Problem2863Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SemiDecreasingView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
