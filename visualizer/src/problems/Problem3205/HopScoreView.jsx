import "./HopScoreView.css";

const CELL = 56;
const GAP = 8;
const x = (i) => i * (CELL + GAP) + CELL / 2;

// Arc from index i to j, drawn above the cells. Taller arcs for longer hops.
function arcPath(i, j, base) {
  const x1 = x(i);
  const x2 = x(j);
  const height = Math.min(120, Math.abs(x2 - x1) * 0.35 + 18);
  return `M ${x1} ${base} Q ${(x1 + x2) / 2} ${base - height * 2} ${x2} ${base}`;
}

export default function HopScoreView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="hs-view" aria-label="Hop score graph">
        <p className="hs-empty">Press Play to test every hop into each index.</p>
      </section>
    );
  }

  const { nums, n } = step;
  const width = n * (CELL + GAP);
  const base = 118;
  const j = step.j;
  const i = step.i;

  return (
    <section className="hs-view" aria-label="Hop score graph">
      <div className="hs-scroll">
        <div className="hs-track" style={{ width }}>
          <svg width={width} height={150} aria-hidden="true">
            <defs>
              <marker id="hs-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {step.from.map((from, to) => (to > 0 && from >= 0 && step.best[to] !== null ? (
              <path key={`chosen-${to}`} d={arcPath(from, to, base)} fill="none" stroke="var(--text-muted)" strokeWidth="2.5" markerEnd="url(#hs-head)" />
            ) : null))}
            {i >= 0 && j >= 0 && i < j && (
              <path d={arcPath(i, j, base)} fill="none" stroke={step.improves ? "var(--success)" : "var(--primary)"}
                strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#hs-head)" />
            )}
          </svg>
          <div className="hs-cells">
            {nums.map((v, idx) => (
              <div key={idx} className="hs-col">
                <span className="hs-tag">{idx === i ? "i" : ""}{idx === j ? "j" : ""}</span>
                <div className={`hs-cell${idx === j ? " hs-cell--target" : ""}${idx === i ? " hs-cell--from" : ""}`}
                  aria-label={`index ${idx}, value ${v}`}>{v}</div>
                <span className="hs-index">{idx}</span>
                <span className={`hs-best${step.best[idx] !== null ? " hs-best--set" : ""}`}>
                  best {step.best[idx] === null ? "-" : step.best[idx] === -Infinity ? "-inf" : step.best[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="hs-message" aria-live="polite">{step.message}</p>
    </section>
  );
}
