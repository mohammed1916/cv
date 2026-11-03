import "./MaxOnesView.css";

// Two panels: the side-by-side pattern (one cell per residue class, labelled with its count)
// and the full board, where a kept residue class shows a 1 on every board cell it covers.
export default function MaxOnesView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="mo-view" aria-label="Maximum number of ones">
        <p className="mo-empty">Press Play to tile the board with a side by side pattern and keep the richest residue classes.</p>
      </section>
    );
  }

  const { width, height, sideLength: S, maxOnes: K } = run.input;
  const picked = new Set(step.picked);
  const order = step.order.length ? new Map(step.order.map((key, index) => [key, index + 1])) : null;
  const cur = step.cur ? `${step.cur[0]},${step.cur[1]}` : null;
  const pickedCount = step.picked.length;
  const unconstrained = S > Math.min(width, height);

  return (
    <section className="mo-view" aria-label="Maximum number of ones">
      <div className="mo-summary">
        <span>Board {width} x {height}</span>
        <span>Window {S} x {S}</span>
        <span>Ones allowed per window: {K}</span>
        <span className="mo-total">Total: {step.total}</span>
      </div>

      {unconstrained && <p className="mo-note">No full window fits, so every cell of the board can be a one.</p>}
      <div className="mo-panels">
        {!unconstrained && (
          <figure className="mo-panel">
            <figcaption>Pattern: count per residue class</figcaption>
            <div className="mo-grid" style={{ gridTemplateColumns: `repeat(${S}, minmax(0, 1fr))` }}>
              {step.counts.map((row, r) => row.map((count, c) => {
                const key = `${r},${c}`;
                const isPicked = picked.has(key);
                const isCur = cur === key;
                const rank = order && order.get(key);
                const cls = ["mo-cell", count === null ? "mo-cell--unknown" : "", isPicked ? "mo-cell--kept" : "", isCur ? "mo-cell--cur" : ""].join(" ");
                return (
                  <div key={key} className={cls} aria-label={`Residue ${r}, ${c}: ${count === null ? "not counted" : count + " cells"}${isPicked ? ", kept as ones" : ""}`}>
                    <strong>{count === null ? "?" : count}</strong>
                    <small>{rank && step.phase !== "count" ? `#${rank}` : `${r},${c}`}</small>
                  </div>
                );
              }))}
            </div>
            <p className="mo-legend">Solid = kept as ones. Outlined = being counted or added now. ? = not counted yet.</p>
          </figure>
        )}

          <figure className="mo-panel">
            <figcaption>Board: kept cells are 1, others 0</figcaption>
            <div className="mo-board" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}>
              {step.board.map((row, i) => row.map((v, j) => (
                <div key={`${i}-${j}`} className={`mo-board-cell ${v ? "mo-board-cell--one" : ""}`} aria-label={`Row ${i}, column ${j}: ${v ? "one" : "zero"}`}>
                  {v ? "1" : "0"}
                </div>
              )))}
            </div>
          </figure>
      </div>

      {!unconstrained && (
        <p className="mo-status" aria-live="polite">
          Kept {pickedCount} of {K} allowed ones{pickedCount >= K ? " (limit used up)" : ""}.
        </p>
      )}
    </section>
  );
}
