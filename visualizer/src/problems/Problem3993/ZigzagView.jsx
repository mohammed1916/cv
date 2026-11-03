import "./ZigzagView.css";

export default function ZigzagView({ run, step }) {
  if (!run || !step) return null;
  const { start, n, m } = run.input;
  const values = step.path ?? [];
  const pool = [start, ...values, step.best ?? start];
  const lo = Math.min(...pool) - 1;
  const hi = Math.max(...pool) + 1;
  const span = Math.max(1, hi - lo);
  const slots = Array.from({ length: n }, (_, i) => i);
  return (
    <div className="zigzag" role="img" aria-label={`Alternating sequence of length ${n} starting at ${start}`}>
      <div className="zigzag__plot">
        {slots.map(i => {
          const v = values[i];
          const has = v !== undefined;
          const heightPct = has ? ((v - lo) / span) * 100 : 0;
          const isBest = has && v === step.best;
          return (
            <div key={i} className="zigzag__slot">
              <div className="zigzag__track">
                {has && (
                  <div className={`zigzag__bar${isBest ? " zigzag__bar--best" : ""}${i === values.length - 1 ? " zigzag__bar--current" : ""}`}
                    style={{ height: `${heightPct}%` }}>
                    <span>{v}</span>
                  </div>
                )}
              </div>
              <span className="zigzag__index">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="zigzag__legend">
        <span>Start <strong>{start}</strong></span>
        <span>Up step <strong>{m}</strong>, down step <strong>1</strong></span>
        {step.pattern && <span>Pattern: <strong>{step.pattern}</strong></span>}
        <span>Best <strong>{step.best}</strong></span>
      </div>
    </div>
  );
}
