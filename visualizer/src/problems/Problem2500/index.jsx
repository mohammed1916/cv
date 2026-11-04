import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GridRemovalView from "./GridRemovalView";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2500",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no row heaps." },
    { id: "build", label: "Build", description: "Turn a row into a max-heap." },
    { id: "heapify", label: "Heapify", description: "The row is now a max-heap." },
    { id: "total", label: "Total", description: "Start the running total." },
    { id: "round", label: "Round", description: "Start a round across all rows." },
    { id: "reset", label: "Reset", description: "Start the best removed value for this round." },
    { id: "pick", label: "Pick", description: "Take the greatest value from the next row." },
    { id: "pop", label: "Remove", description: "Remove that value and keep the largest removed so far." },
    { id: "add", label: "Add", description: "Add the round's largest removed value to the total." },
    { id: "done", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"grid": [[1,2,4],[3,3,1]]}',
  url: "https://leetcode.com/problems/delete-greatest-value-in-each-row/",
  complexity: "O(m * n * log n) time and O(m * n) space for m rows and n columns. The visualization caps the grid at 10 by 10 with values up to 100.",
  examples: [
    { label: "Two rows", input: '{"grid":[[5,1,4],[2,6,3]]}' },
    { label: "One row", input: '{"grid":[[7,2,9]]}' },
  ],
};

export default function DeleteGreatestValueVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GridRemovalView grid={run.input.grid} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
