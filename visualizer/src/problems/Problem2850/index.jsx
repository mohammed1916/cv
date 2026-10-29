import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Collect surplus stones and empty cells." },
    { id: "search", label: "Search", description: "Try moving the next surplus stone to a free empty cell." },
    { id: "prune", label: "Prune", description: "Stop a branch whose cost already reaches the best answer." },
    { id: "assign", label: "Assign", description: "Mark a cell as used and add the move distance." },
    { id: "undo", label: "Undo", description: "Unmark the cell and explore the next option." },
    { id: "record", label: "Record", description: "Every stone is placed, so record the cost." },
    { id: "done", label: "Result", description: "Report the minimum total moves." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Grid (JSON object with grid, 3 rows of 3 cells summing to 9)',
  url: "https://leetcode.com/problems/minimum-moves-to-spread-stones-over-grid/",
  complexity: "Backtracking over surplus stones and empty cells, pruned by the best cost so far. The visualization fixes the grid at 3 by 3 with nine stones.",
  examples: [
    { label: "Example 1", input: '{"grid":[[1,1,0],[1,1,1],[1,2,1]]}' },
    { label: "Example 2", input: '{"grid":[[1,3,0],[1,0,0],[1,0,3]]}' },
  ],
};

export default function MinimumMovesSpreadStones() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="Grid cells (row-major, stones per cell)"
          length={9}
          valueAt={(i) => step.cells[i]}
          active={step.path.length ? step.path[step.path.length - 1].to : -1}
          roleAt={(i) => (step.path.some((m) => m.to === i) ? "target" : step.path.some((m) => m.from === i) ? "source" : "")}
        />
      )}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>Best so far: {step.best === null ? "none yet" : step.best}. Current cost: {step.cost}.</p>
        </>
      )}
    />
  );
}
