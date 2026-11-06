import "./KnightWaveView.css";

// The board window, drawn as a grid. Cells already reached show their distance and a colour by distance.
// Outlined cells are the queue (reached but not yet expanded). The knight marks the cell being expanded,
// the dashed cell is the candidate move being checked, and the star marks the target.
export default function KnightWaveView({ run, step }) {
  if (!run || !step) return null;
  const { margin } = run;
  const size = 2 * margin + 1;
  const known = new Map();
  run.order.slice(0, step.discovered).forEach((cell) => known.set(`${cell.r},${cell.c}`, cell.dist));
  const queue = new Set(run.order.slice(step.popped, step.discovered).map((cell) => `${cell.r},${cell.c}`));
  const maxDist = Math.max(1, ...run.order.map((cell) => cell.dist));
  const cells = [];
  for (let r = margin; r >= -margin; r -= 1) {
    for (let c = -margin; c <= margin; c += 1) {
      cells.push([r, c]);
    }
  }
  const key = (r, c) => `${r},${c}`;
  const current = step.current;
  const candidate = step.candidate;
  return (
    <div className="kw-view">
      <div className="kw-board" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        role="grid" aria-label={`Knight search window from -${margin} to ${margin}`}>
        {cells.map(([r, c]) => {
          const k = key(r, c);
          const dist = known.get(k);
          const reached = dist !== undefined;
          const isCurrent = current && current.r === r && current.c === c;
          const isCandidate = candidate && candidate.r === r && candidate.c === c;
          const isTarget = r === run.input.x && c === run.input.y;
          const isOrigin = r === 0 && c === 0;
          const classes = ["kw-cell", reached ? "" : "kw-cell--unknown", queue.has(k) ? "kw-cell--queue" : "",
            isCurrent ? "kw-cell--current" : "", isCandidate ? (step.isNew ? "kw-cell--new" : "kw-cell--seen") : "",
            isTarget ? "kw-cell--target" : "", isOrigin ? "kw-cell--origin" : ""].filter(Boolean).join(" ");
          return (
            <span key={k} role="gridcell" className={classes}
              style={reached ? { background: `color-mix(in srgb, var(--primary) ${Math.round(12 + (dist / maxDist) * 30)}%, var(--surface2))` } : undefined}
              aria-label={`(${r}, ${c}) ${reached ? `distance ${dist}` : "not reached"}`}>
              {isCurrent ? "♞" : isTarget ? "★" : isOrigin ? "O" : reached ? dist : ""}
            </span>
          );
        })}
      </div>
      <p className="kw-legend">
        <span className="kw-key kw-key--queue">outlined = in the queue</span>
        <span className="kw-key kw-key--current">♞ expanding</span>
        <span className="kw-key kw-key--candidate">dashed = move being checked</span>
        <span className="kw-key kw-key--target">★ target ({run.input.x}, {run.input.y})</span>
      </p>
      <p className="kw-readout" role="status">
        {current && candidate
          ? `From (${current.r}, ${current.c}) at ${current.dist}: (${candidate.r}, ${candidate.c}) ${step.isNew ? "is new" : "is already known"}.`
          : current ? `Expanding (${current.r}, ${current.c}), ${current.dist} move${current.dist === 1 ? "" : "s"} away.`
          : step.phase === "done" ? `Answer: ${run.answer} move${run.answer === 1 ? "" : "s"}.` : "Start at O."}
      </p>
    </div>
  );
}
