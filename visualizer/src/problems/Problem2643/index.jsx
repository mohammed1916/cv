import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with no best row yet." },
    { id: "row", label: "Row", description: "Move to the next row." },
    { id: "count", label: "Count", description: "Count the ones in this row." },
    { id: "compare", label: "Compare", description: "Compare with the best count so far." },
    { id: "update", label: "Update", description: "Record this row as the new best." },
    { id: "done", label: "Result", description: "Return the best row index and its count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary matrix JSON (e.g. {"mat": [[0,0,0],[0,1,1]]})',
  url: "https://leetcode.com/problems/row-with-maximum-ones/",
  complexity: "O(m * n) time and O(1) extra space for an m x n binary matrix. Both dimensions are at most 100.",
  examples: [
    { label: "Example 1", input: '{"mat": [[0,1],[1,0]]}' },
    { label: "Example 2", input: '{"mat": [[0,0,0],[0,1,1]]}' },
    { label: "Example 3", input: '{"mat": [[0,0],[1,1],[0,0]]}' },
  ],
};

export default function RowWithMaximumOnes() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Ones counted per row (-1 = not yet counted)"
            length={run.input.mat.length}
            valueAt={index => step.counts[index]}
            active={step.i ?? -1}
            roleAt={index => (index === step.bestRow && step.bestCount >= 0 ? "best" : "")}
          />
          <p>Best so far: row {step.bestRow} with {step.bestCount} ones</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
