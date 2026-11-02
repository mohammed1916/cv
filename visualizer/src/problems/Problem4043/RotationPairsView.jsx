import "./RotationPairsView.css";

// Each row is one rotation, drawn as character tiles. Equal neighbours are joined by a bridge,
// the scanned pair is highlighted, and rows that match k are marked in green.
export default function RotationPairsView({ run, step }) {
  if (!run || !step) {
    return <section className="rp-view" aria-label="Rotations and equal pairs"><p className="rp-empty">Press Play to rotate the string one prefix at a time.</p></section>;
  }
  const { s, k } = run;
  const n = s.length;
  const finished = new Map(step.rows.map(row => [row.p, row]));
  const activeRow = step.p;
  const rowsToShow = Array.from({ length: n }, (_, p) => p);

  return (
    <section className="rp-view" aria-label="Rotations of the string">
      <p className="rp-goal">Target: exactly <b>{k}</b> equal adjacent pair{k === 1 ? "" : "s"}. Matches so far: <b>{step.answer}</b>.</p>
      <ol className="rp-rows">
        {rowsToShow.map(p => {
          const t = s.slice(p) + s.slice(0, p);
          const done = finished.get(p);
          const isActive = activeRow === p;
          const matched = done ? done.pairs === k : false;
          const scanning = isActive && step.i !== null && step.i !== undefined ? step.i : -1;
          return (
            <li key={p} className={["rp-row", isActive ? "rp-row--active" : "", done ? (matched ? "rp-row--match" : "rp-row--seen") : ""].join(" ")}>
              <span className="rp-prefix">{p === 0 ? "no move" : `move ${p}`}</span>
              <span className="rp-tiles">
                {Array.from(t).map((ch, i) => (
                  <span key={i} className="rp-tile-wrap">
                    <span className={`rp-tile ${scanning === i ? "rp-tile--scan" : ""}`}>{ch}</span>
                    {i < n - 1 && (
                      <span className={`rp-gap ${t[i] === t[i + 1] ? "rp-gap--equal" : ""} ${scanning === i ? "rp-gap--scan" : ""}`} aria-hidden="true">
                        {t[i] === t[i + 1] ? "=" : ""}
                      </span>
                    )}
                  </span>
                ))}
              </span>
              <span className="rp-count">
                {isActive ? `${step.pairs} so far` : done ? `${done.pairs} pair${done.pairs === 1 ? "" : "s"}` : "-"}
                {done && matched && <span className="rp-badge"> match</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="rp-note">{step.message}</p>
    </section>
  );
}
