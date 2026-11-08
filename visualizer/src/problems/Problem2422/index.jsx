import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import EndMergeView from "./EndMergeView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2422",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of positive integers (e.g. [4,3,2,1,2,3,1])",
  url: "https://leetcode.com/problems/merge-operations-to-turn-array-into-a-palindrome/description/",
  complexity: "O(n) time and O(1) extra space for n values. The visualization caps the array at 12 values of at most 100.",
  examples: [
    { label: "Example", input: "[4,3,2,1,2,3,1]" },
    { label: "Already palindrome", input: "[1,2,1]" },
    { label: "Two values", input: "[1,2]" },
    { label: 'Single value', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5,5]' },
    { label: 'Largest values', input: '[100,1,100,1,100,1,100,1,100,1,100,1]' },
    { label: 'Long run: 12 items', input: '[12,92,70,48,55,30,14,86,31,57,54,82]' },
  ],
};

export default function MergeOperationsPalindrome() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <EndMergeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Two pointers grow a left group and a right group from the ends. When the groups are equal they match and move inward. Otherwise the smaller group must merge with its neighbour, since merging is the only way to grow it.
          {run ? ` Final answer: ${run.result} operation${run.result === 1 ? "" : "s"}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
