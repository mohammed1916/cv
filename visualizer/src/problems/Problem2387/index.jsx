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
    { label: 'Single cell', input: '[[9]]' },
    { label: 'Single row', input: '[[2,4,8]]' },
    { label: 'All equal', input: '[[3,3,3],[3,3,3],[3,3,3]]' },
    { label: 'Largest 5 by 5 grid', input: '[[1,2,3,4,5],[10,20,30,40,50],[60,70,80,90,100],[1,1,1,1,1],[100,100,100,100,100]]' },
    { label: 'Long run: 5 by 5 grid', input: '[[24,32,40,40,79],[11,16,27,28,40],[23,42,54,67,95],[7,53,56,57,74],[6,23,80,87,100]]' },
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
