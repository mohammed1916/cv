import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: 3127,
  phases: [
    { id: "setup", label: "Setup", description: "Start the scan of 2 by 2 squares." },
    { id: "scan", label: "Scan", description: "Choose the next 2 by 2 square." },
    { id: "check", label: "Check", description: "Count the blue cells in the square." },
    { id: "done", label: "Result", description: "Report whether one change is enough." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"grid": [["B","W","B"],["B","W","W"],["B","W","B"]]}',
  url: "https://leetcode.com/problems/make-a-square-with-the-same-color/",
  complexity: "O(1) time and O(1) space for the fixed 3 by 3 grid.",
  examples: [{ label: "Example 1", input: '{"grid":[["B","W","B"],["B","W","W"],["B","W","B"]]}' }],
};

export default function SquareSameColorVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence label="Grid cells, row by row" length={9}
          valueAt={i => run.input.grid[Math.floor(i / 3)][i % 3]}
          active={step.square ? step.square[0] * 3 + step.square[1] : -1}
          roleAt={i => (step.cells?.includes(i) ? "active" : "")} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
