import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SnailGridView from "./SnailGridView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2624",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Snail input (e.g. {"arr":[1,2,3,4,5,6],"rowsCount":2,"colsCount":3})',
  url: "https://leetcode.com/problems/snail-traversal/description/",
  complexity: "O(rowsCount × colsCount) time and output space, one write per array value. The visualization caps the grid at 8 × 8 and the array at 64 values. The draft gives no official bound.",
  examples: [
    { label: "2 by 3 snail fill", input: '{"arr":[1,2,3,4,5,6],"rowsCount":2,"colsCount":3}' },
    { label: "One row", input: '{"arr":[1,2,3,4],"rowsCount":1,"colsCount":4}' },
    { label: "One column", input: '{"arr":[1,2,3,4],"rowsCount":4,"colsCount":1}' },
    { label: "Size mismatch", input: '{"arr":[1,2,3],"rowsCount":2,"colsCount":2}' },
  ],
};

export default function Problem2624Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SnailGridView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result.length === 0 ? "empty list" : `${run.result.length} row${run.result.length === 1 ? "" : "s"}`}.` : ""}
        </p>
      )}
    />
  );
}
