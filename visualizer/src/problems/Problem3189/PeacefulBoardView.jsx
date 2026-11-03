import "./PeacefulBoardView.css";

export default function PeacefulBoardView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pb-view" aria-label="Peaceful board">
        <p className="pb-empty">Press Play to place the rooks and fix each axis.</p>
      </section>
    );
  }

  const { n, rooks } = step;
  const sorted = step.axis === "row" ? step.rows : step.axis === "col" ? step.cols : null;
  const counts = new Map(rooks.map(([r, c]) => [`${r},${c}`, 0]));
  rooks.forEach(([r, c]) => counts.set(`${r},${c}`, counts.get(`${r},${c}`) + 1));

  return (
    <section className="pb-view" aria-label="Peaceful board">
      <div className="pb-board" role="grid" style={{ gridTemplateColumns: `repeat(${n}, 42px)` }}>
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n);
          const c = k % n;
          const hits = counts.get(`${r},${c}`) || 0;
          const target = (step.axis === "row" && r === step.rank) || (step.axis === "col" && c === step.rank);
          return (
            <div key={k} role="gridcell" className={`pb-cell${target ? " pb-cell--target" : ""}`}
              aria-label={`row ${r}, column ${c}${hits ? `, ${hits} rook${hits > 1 ? "s" : ""}` : ""}`}>
              {hits > 0 && <span className="pb-rook" aria-hidden="true">R</span>}
              {hits > 1 && <span className="pb-count">{hits}</span>}
            </div>
          );
        })}
      </div>
      <p className="pb-caption">
        {sorted
          ? `Shaded lane: ${step.axis === "row" ? "row" : "column"} ${step.rank}, the target for the ${step.rank + 1}${step.rank === 0 ? "st" : step.rank === 1 ? "nd" : step.rank === 2 ? "rd" : "th"} smallest ${step.axis === "row" ? "row" : "column"}.`
          : "Rooks sit where they start; no axis is fixed yet."}
      </p>
      {sorted && (
        <ol className="pb-ranks" aria-label="Sorted ranks">
          {sorted.slice(0, step.rank + 1).map((value, i) => (
            <li key={i} className={i === step.rank ? "pb-now" : ""}>
              rank {i}: {step.axis} {value} to {i}, {Math.abs(value - i)} move{Math.abs(value - i) === 1 ? "" : "s"}
            </li>
          ))}
        </ol>
      )}
      <output aria-label="Running total">Total moves so far: {step.total}</output>
    </section>
  );
}
