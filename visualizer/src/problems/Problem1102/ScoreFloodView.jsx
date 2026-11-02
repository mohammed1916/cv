import "./ScoreFloodView.css";

// Each cell shows its grid value (large) and its best path score (small badge).
// Colour follows the best path score, so the flood shows which cells a high-minimum path can reach.
export default function ScoreFloodView({ run, step }) {
  if (!run || !step) return null;
  const grid = run.input;
  const rows = grid.length;
  const cols = grid[0].length;
  const maxValue = Math.max(1, ...grid.flat());
  const frontierKeys = new Set(step.frontier.map((cell) => `${cell.r},${cell.c}`));
  const bestAt = (r, c) => step.best[r][c];
  return (
    <div className="sf-view">
      <div className="sf-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="table" aria-label="Grid with best path scores">
        {grid.map((row, r) => row.map((value, c) => {
          const best = bestAt(r, c);
          const key = `${r},${c}`;
          const isCurrent = step.current && step.current.r === r && step.current.c === c;
          const isNeighbour = step.neighbour && step.neighbour.r === r && step.neighbour.c === c;
          const reached = best >= 0;
          const heat = reached ? Math.round((best / maxValue) * 100) : 0;
          const classes = ["sf-cell", reached ? "" : "sf-cell--unreached", isCurrent ? "sf-cell--current" : "",
            isNeighbour ? (step.improved ? "sf-cell--improved" : "sf-cell--rejected") : "", frontierKeys.has(key) ? "sf-cell--frontier" : ""]
            .filter(Boolean).join(" ");
          return (
            <div key={key} role="cell" className={classes}
              style={reached ? { background: `color-mix(in srgb, var(--sf-heat) ${heat}%, var(--sf-base))` } : undefined}
              aria-label={`cell ${r},${c} value ${value} best ${reached ? best : "none"}`}>
              <span className="sf-cell__value">{value}</span>
              <span className="sf-cell__best">{reached ? `best ${best}` : "–"}</span>
              {frontierKeys.has(key) && <span className="sf-cell__mark" aria-hidden="true">◆</span>}
              {(r === 0 && c === 0) && <span className="sf-cell__corner">start</span>}
              {(r === rows - 1 && c === cols - 1) && <span className="sf-cell__corner sf-cell__corner--end">end</span>}
            </div>
          );
        }))}
      </div>
      <p className="sf-legend">
        <span className="sf-key sf-key--current">expanding</span>
        <span className="sf-key sf-key--improved">improves a neighbour</span>
        <span className="sf-key sf-key--rejected">no improvement</span>
        <span className="sf-key sf-key--frontier">◆ waiting in the frontier</span>
      </p>
      <p className="sf-readout" role="status">
        {step.current && step.neighbour
          ? `Neighbour (${step.neighbour.r}, ${step.neighbour.c}) scores ${step.score}.`
          : step.current ? `Expanding (${step.current.r}, ${step.current.c}).` : step.phase === "done" ? `Answer ${run.answer}.` : "Start at the top-left cell."}
      </p>
    </div>
  );
}
