import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SortedRowsView from "./SortedRowsView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2387",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Matrix of sorted rows with an odd total count (e.g. [[1,3,5],[2,4,6],[7,8,9]])",
  url: "https://leetcode.com/problems/median-of-a-row-wise-sorted-matrix/description/",
  complexity: "O(m log(max - min)) time with O(1) extra space for m rows, each binary-searched. The visualization caps the matrix at 6 x 6 with values 1 to 100.",
  examples: [
    { label: "Example", input: "[[1,3,5],[2,6,9],[3,6,9]]" },
    { label: "Repeats", input: "[[1,1,2],[1,1,2],[3,3,3]]" },
  ],
};

export default function MedianRowWiseSorted() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SortedRowsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          The median is the smallest value x such that at least half the elements are at most x. That property is monotone, so a binary search over values finds it. Each probe counts the elements at most mid in every sorted row with a binary search.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
