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
  inputLabel: "Grid of distinct integers (e.g. [[3,1],[2,4]])",
  url: "https://leetcode.com/problems/minimize-maximum-value-in-a-grid/description/",
  complexity: "O(mn log(mn)) time for the sort and O(mn) space for an m x n grid. The visualization caps the grid at 6 x 6 with values 1 to 100; the official bounds are not verified in this draft.",
  examples: [
    { label: "Example", input: "[[3,1],[2,4]]" },
    { label: "Single row", input: "[[7,3,9]]" },
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
