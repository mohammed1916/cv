import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RotationPairsView from "./RotationPairsView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "4043",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON, e.g. {"s":"aabb","k":2}',
  url: "https://leetcode.com/problems/count-rotations-with-exactly-k-equal-adjacent-pairs/",
  complexity: "O(n^2) time and O(n) extra space: each of the n rotations is checked in O(n). The note's bounds (lowercase string of length 2 to 100, 0 <= k <= n - 1) are checked on parse; the visualization caps the string at 12 characters.",
  examples: [
    { label: "aabb, k = 2 gives 2", input: JSON.stringify({ s: "aabb", k: 2 }) },
    { label: "abab, k = 0 gives 4", input: JSON.stringify({ s: "abab", k: 0 }) },
    { label: "aaaa, k = 3 gives 4", input: JSON.stringify({ s: "aaaa", k: 3 }) },
  ],
};

export default function Problem4043Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RotationPairsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
