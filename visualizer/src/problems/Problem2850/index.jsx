import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
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
        <>
          <div role="img" aria-label="3 by 3 grid of stones" style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 6, width: "max-content" }}>
            {Array.from({ length: 9 }, (_, i) => {
              const isTo = step.path.some(m => m.to === i);
              const isFrom = step.path.some(m => m.from === i);
              const isCurrent = step.path.length && step.path[step.path.length - 1].to === i;
              return <div key={i} data-cell={i} data-role={isCurrent ? "current" : isTo ? "target" : isFrom ? "source" : ""} style={{
                height: 56, display: "grid", placeItems: "center", borderRadius: 8, border: "2px solid var(--border, currentColor)",
                background: isCurrent ? "var(--primary)" : isTo ? "var(--surface2)" : "transparent", color: isCurrent ? "var(--surface)" : "var(--text)",
              }}>
                <div style={{ textAlign: "center" }}><small>cell {i}</small><div style={{ fontSize: 20, fontWeight: 700 }}>{step.cells[i]}</div></div>
              </div>;
            })}
          </div>
          <ol aria-label="Moves so far" style={{ color: "var(--text)" }}>
            {step.path.map((m, i) => <li key={i}>{`stone from cell ${m.from} to cell ${m.to}`}</li>)}
          </ol>
          <output aria-label="Cell colours" style={{ color: "var(--text)" }}>{`Stones per cell after moves so far, read row by row: ${step.cells.join(" ")}`}</output>
        </>
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
