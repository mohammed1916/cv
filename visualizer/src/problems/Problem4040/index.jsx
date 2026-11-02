import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SubsetCostView from "./SubsetCostView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "4040",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON, e.g. {"nums":[3,7],"sum":6}',
  url: "https://leetcode.com/problems/minimum-operations-to-form-subset-sum-i/",
  complexity: "O(n * sum * V) time, where V is the number of distinct reachable values per element (at most 14 x 14 combinations, deduplicated), and O(sum) extra space. The note's bounds are checked on parse (length up to 100, values up to 500, sum up to 5000); the visualization caps the array at 6 values and the sum at 24.",
  examples: [
    { label: "[3,7] sum 6 gives 1", input: JSON.stringify({ nums: [3, 7], sum: 6 }) },
    { label: "[5,5] sum 10 gives 0", input: JSON.stringify({ nums: [5, 5], sum: 10 }) },
    { label: "[1,2] sum 7 gives -1", input: JSON.stringify({ nums: [1, 2], sum: 7 }) },
  ],
};

export default function Problem4040Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SubsetCostView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
