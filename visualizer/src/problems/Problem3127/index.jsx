import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MatrixGrid from "../../components/shared/MatrixGrid";
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
  examples: [
    { label: "Example 1", input: '{"grid":[["B","W","B"],["B","W","W"],["B","W","B"]]}' },
    { label: "All white", input: "{\"grid\":[[\"W\",\"W\",\"W\"],[\"W\",\"W\",\"W\"],[\"W\",\"W\",\"W\"]]}" },
    { label: "All black", input: "{\"grid\":[[\"B\",\"B\",\"B\"],[\"B\",\"B\",\"B\"],[\"B\",\"B\",\"B\"]]}" },
    { label: "Checkerboard", input: "{\"grid\":[[\"B\",\"W\",\"B\"],[\"W\",\"B\",\"W\"],[\"B\",\"W\",\"B\"]]}" },
    { label: "Single black centre", input: "{\"grid\":[[\"W\",\"W\",\"W\"],[\"W\",\"B\",\"W\"],[\"W\",\"W\",\"W\"]]}" },
  ],
};

export default function SquareSameColorVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const [r, c] = step.square ?? [-1, -1];
        const windowCells = [];
        if (step.square) {
          for (let dr = 0; dr < 2; dr += 1) for (let dc = 0; dc < 2; dc += 1) windowCells.push({ row: r + dr, col: c + dc });
        }
        const blue = windowCells.filter(({ row, col }) => run.input.grid[row][col] === "B").length;
        return (
          <>
            <MatrixGrid
              matrix={run.input.grid}
              label="3 by 3 grid; the highlighted cells are the current 2 by 2 square"
              highlightedCells={windowCells}
              activeCell={step.square && step.phase === "done" ? { row: r, col: c } : null}
              cellWidth={56}
              cellHeight={52}
            />
            <p className="algorithm-workspace__event" role="status">{step.message}</p>
            {step.square && <output aria-label="Blue cells in square">{`Blue cells in this square: ${blue}`}</output>}
          </>
        );
      }}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>A square can become one color with one change only when it holds one or three blue cells. Zero or four is already solid, and two cannot be fixed by one change.</p>
        </>
      )}
    />
  );
}
