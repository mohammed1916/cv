import "./ClearingGridView.css";

// The grid as the current state sees it. A cleared row or column is hatched and dimmed,
// a cell that is still 1 is solid, and the cell just chosen is outlined.
export default function ClearingGridView({ run, step }) {
  const grid = run.input.grid;
  const rowMask = step.rowMask ?? 0;
  const colMask = step.colMask ?? 0;
  const live = new Set((step.ones ?? []).map(([r, c]) => `${r},${c}`));
  const chosen = step.chosen ? `${step.chosen[0]},${step.chosen[1]}` : null;
  const cols = grid[0].length;

  return (
    <div className="cgv" aria-label="Grid with cleared rows and columns">
      <div className="cgv__stats" role="status">
        <span>Operations so far: <strong>{step.ops ?? 0}</strong></span>
        <span>Ones left: <strong>{(step.ones ?? []).length}</strong></span>
        <span>Waiting in queue: <strong>{step.queued ?? 0}</strong></span>
      </div>
      <div className="cgv__grid" style={{ gridTemplateColumns: `2.2rem repeat(${cols}, 2.8rem)` }}>
        <span />
        {grid[0].map((_, c) => (
          <span key={`ch${c}`} className={`cgv__head${(colMask >> c) & 1 ? " is-cleared" : ""}`}>col {c}</span>
        ))}
        {grid.map((row, r) => (
          <FragmentRow key={`r${r}`} r={r} row={row} rowCleared={(rowMask >> r) & 1} colMask={colMask} live={live} chosen={chosen} />
        ))}
      </div>
      <p className="cgv__note">
        {step.chosen ? `Clearing row ${step.chosen[0]} and column ${step.chosen[1]} zeroes every cell in both.` : step.phase === "done" ? "Every one is cleared." : "Each operation picks one 1 and clears its row and column."}
      </p>
    </div>
  );
}

function FragmentRow({ r, row, rowCleared, colMask, live, chosen }) {
  return (
    <>
      <span className={`cgv__head${rowCleared ? " is-cleared" : ""}`}>row {r}</span>
      {row.map((_, c) => {
        const key = `${r},${c}`;
        const cleared = rowCleared || (colMask >> c) & 1;
        const isLive = live.has(key);
        const cls = ["cgv__cell", isLive ? "is-live" : cleared ? "is-cleared" : "is-zero", chosen === key ? "is-chosen" : ""].join(" ");
        return (
          <span key={key} className={cls} aria-label={`row ${r} column ${c} ${isLive ? "one" : "zero"}`}>
            {isLive ? "1" : "0"}
          </span>
        );
      })}
    </>
  );
}
