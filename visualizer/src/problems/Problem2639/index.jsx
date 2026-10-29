import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Read the grid size and start every column width at 0." },
    { id: "row", label: "Row", description: "Move to the next row." },
    { id: "cell", label: "Cell", description: "Measure the text length of one cell." },
    { id: "update", label: "Update", description: "Keep the longer of the stored width and this length." },
    { id: "done", label: "Result", description: "Return one width per column." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Grid JSON (e.g. {"grid": [[-15,1,3],[15,7,12],[5,6,-2]]})',
  url: "https://leetcode.com/problems/find-the-width-of-columns-of-a-grid/",
  complexity: "O(m * n) time and O(n) space for an m x n grid. Both dimensions are at most 100.",
  examples: [
    { label: "Example 1", input: '{"grid": [[1],[22],[333]]}' },
    { label: "Example 2", input: '{"grid": [[-15,1,3],[15,7,12],[5,6,-2]]}' },
  ],
};

export default function FindTheWidthOfColumnsOfAGrid() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Column widths so far"
            length={run.input.grid[0].length}
            valueAt={index => step.widths[index]}
            active={step.c ?? -1}
            roleAt={index => (step.phase === "update" && index === step.c && step.changed ? "grew" : "")}
          />
          {step.phase === "cell" && (
            <p>Cell [{step.r}][{step.c}] = {step.text} (length {step.length})</p>
          )}
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
