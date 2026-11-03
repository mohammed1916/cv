import "./LightCycleView.css";

export default function LightCycleView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="lc-view" aria-label="Synchronized traffic lights">
        <p className="lc-empty">Press Play to place each car at its remainder within the shared cycle.</p>
      </section>
    );
  }

  const { period, green } = run.input;
  const pct = v => `${(100 * v) / period}%`;
  const hasCar = step.arrival !== undefined && step.arrival >= 0 && step.r !== null;

  return (
    <section className="lc-view" aria-label="Synchronized traffic lights">
      <p className="lc-caption">Shared cycle of {period}. Each light is green for its first g units of every cycle.</p>
      <div className="lc-lights">
        {green.map((g, i) => (
          <div key={i} className={`lc-light${hasCar && step.light === i ? " lc-light--chosen" : ""}`}>
            <span className="lc-light__name">light {i} (green {g})</span>
            <span className="lc-track">
              <span className="lc-green" style={{ width: pct(g) }} />
            </span>
          </div>
        ))}
      </div>
      <div className="lc-cycle" role="img" aria-label={`Cycle of ${period}; longest green ${step.longest}`}>
        <div className="lc-cycle__green" style={{ width: pct(step.longest) }} />
        <div className="lc-cycle__wait" style={{ left: pct(step.longest), width: pct(period - step.longest) }} />
        {hasCar && <div className="lc-car" style={{ left: pct(step.r) }} title={`remainder ${step.r}`} />}
      </div>
      <dl className="lc-cards">
        <div><dt>Car</dt><dd>{hasCar ? `${step.arrival + 1} at ${step.time}` : "-"}</dd></div>
        <div><dt>Remainder</dt><dd>{hasCar ? step.r : "-"}</dd></div>
        <div><dt>Waits</dt><dd>{hasCar ? step.wait : "-"}</dd></div>
        <div><dt>Worst so far</dt><dd>{step.worst}</dd></div>
      </dl>
      <p className="lc-status">{step.message}</p>
    </section>
  );
}
