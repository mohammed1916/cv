import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LuckyBitsView from "./LuckyBitsView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2802",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "k, a positive integer (e.g. 5)",
  url: "https://leetcode.com/problems/find-the-k-th-lucky-number/",
  complexity: "O(log k) time and O(log k) space: the answer has about log2(k) digits. The answer is returned as a digit string, exact at any length. The draft gives no verified bound on k, so the visualization caps k at 126 (lucky numbers up to six digits).",
  examples: [
    { label: "k = 5 gives 74", input: "5" },
    { label: "k = 4 gives 47", input: "4" },
    { label: "k = 7 gives 444", input: "7" },
  ],
};

export default function Problem2802Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LuckyBitsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.answer}.` : ""}
        </p>
      )}
    />
  );
}
