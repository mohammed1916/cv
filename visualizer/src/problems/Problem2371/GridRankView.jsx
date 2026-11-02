import "./GridRankView.css";

// Original values in the cells, with the assigned rank shown beside each one. The active cell is outlined.
export default function GridRankView({ run, step }) {
  if (!run || !step) {
    return <section className="rank-view" aria-label="Grid ranks"><p className="rank-empty">Press Play to assign ranks.</p></section>;
  }
  const grid = run.input;
  const m = grid.length;
  const n = grid[0].length;
  const [ar, ac] = step.cell || [-1, -1];
  return (
    <section className="rank-view" aria-label="Grid ranks">
      <div className="rank-grid" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(72px, 1fr))` }}>
        <span className="rank-corner">row \ col</span>
        {Array.from({ length: n }, (_, c) => <span key={`h${c}`} className={`rank-head${c === ac ? " rank-head--active" : ""}`}>col {c} max {step.colMax[c]}</span>)}
        {Array.from({ length: m }, (_, r) => (
          <FragmentRow key={r} r={r} n={n} grid={grid} step={step} ar={ar} ac={ac} />
        ))}
      </div>
      <p className="rank-legend">Each cell shows its original value (top) and its assigned rank (bottom, once placed). Amber outline marks the cell being placed.</p>
    </section>
  );
}

function FragmentRow({ r, n, grid, step, ar, ac }) {
  return (
    <>
      <span className={`rank-head${r === ar ? " rank-head--active" : ""}`}>row {r} max {step.rowMax[r]}</span>
      {Array.from({ length: n }, (_, c) => {
        const placed = step.assigned[r][c];
        const active = r === ar && c === ac;
        return (
          <span key={`${r}-${c}`} className={`rank-cell${placed ? " rank-cell--placed" : ""}${active ? " rank-cell--active" : ""}`}>
            <span className="rank-original">{grid[r][c]}</span>
            <span className="rank-assigned">{placed ? `rank ${placed}` : "?"}</span>
          </span>
        );
      })}
    </>
  );
}
