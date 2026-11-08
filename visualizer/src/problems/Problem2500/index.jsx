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
    { label: 'Single cell', input: '{"grid":[[1]]}' },
    { label: 'Equal values', input: '{"grid":[[4,4],[4,4]]}' },
    { label: 'Largest grid, largest values', input: '{"grid":[[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100],[100,100,100,100,100,100,100,100,100,100]]}' },
    { label: 'Long run: 10 by 10 grid', input: '{"grid":[[82,63,90,75,80,94,12,90,72,68],[32,12,96,25,24,60,97,75,90,30],[17,41,35,72,53,72,31,22,3,94],[68,59,31,31,76,25,25,1,52,43],[28,71,46,11,59,30,73,61,67,7],[65,9,78,57,78,33,22,75,16,61],[61,17,37,54,50,43,56,6,99,17],[59,19,26,100,88,98,12,52,68,86],[93,25,84,50,71,87,28,57,5,45],[72,20,25,27,36,3,87,63,72,14]]}' },
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
