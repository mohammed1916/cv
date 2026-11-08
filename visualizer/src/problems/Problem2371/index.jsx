import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GridRankView from "./GridRankView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2371",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Grid of distinct integers (e.g. [[5,2],[1,6]])",
  url: "https://leetcode.com/problems/minimize-maximum-value-in-a-grid/description/",
  complexity: "O(mn log(mn)) time for the sort and O(mn) space for an m x n grid. The visualization caps the grid at 6 x 6 with values 1 to 100.",
  examples: [
    { label: "Example", input: "[[5,2],[1,6]]" },
    { label: "Single row", input: "[[7,3,9]]" },
    { label: 'Single cell', input: '[[42]]' },
    { label: 'Single column', input: '[[4],[9],[1]]' },
    { label: 'Largest 6 by 6 grid', input: '[[100,99,98,97,96,95],[94,93,92,91,90,89],[88,87,86,85,84,83],[82,81,80,79,78,77],[76,75,74,73,72,71],[70,69,68,67,66,65]]' },
    { label: 'Long run: 6 by 6 grid', input: '[[63,60,91,23,27,48],[93,46,66,99,68,30],[56,13,42,69,2,26],[5,10,74,25,88,97],[96,89,72,31,57,18],[38,51,54,33,17,64]]' },
  ],
};

export default function MinimizeMaximumValueInGrid() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GridRankView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Smaller original values are placed first. Each cell takes one more than the larger of its row's and column's current maximum, which keeps every row and column strictly ordered.
          {run ? ` The largest assigned value is ${run.best}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
