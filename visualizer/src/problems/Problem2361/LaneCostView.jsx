import "./LaneCostView.css";

const show = v => (v === Infinity || v === null || v === undefined ? "-" : v);

// Two lanes of stops: the regular line and the express line, with the cheapest cost to stand on each.
export default function LaneCostView({ run, step }) {
  if (!run || !step) {
    return <section className="lane-view" aria-label="Train line costs"><p className="lane-empty">Press Play to walk the stops.</p></section>;
  }
  const { regular, express, expressCost } = run.input;
  const current = step.stop;
  const reachedR = step.phase === "done" ? run.result : null;
  return (
    <section className="lane-view" aria-label="Train line costs">
      <p className="lane-rule">Switching to express costs <strong>{expressCost}</strong>. Switching back to regular costs 0.</p>
      <div className="lane-grid" style={{ gridTemplateColumns: `auto repeat(${regular.length}, minmax(48px, 1fr))` }}>
        <span className="lane-corner">stop</span>
        {regular.map((_, i) => (
          <span key={`h${i}`} className={`lane-head${i === current ? " lane-head--active" : ""}`}>{i}</span>
        ))}
        <span className="lane-label">Regular line</span>
        {regular.map((cost, i) => (
          <span key={`r${i}`} className={`lane-cell lane-cell--regular${i === current ? " lane-cell--active" : ""}`}>+{cost}</span>
        ))}
        <span className="lane-label">Express line</span>
        {express.map((cost, i) => (
          <span key={`e${i}`} className={`lane-cell lane-cell--express${i === current ? " lane-cell--active" : ""}`}>+{cost}</span>
        ))}
        <span className="lane-label">Cheapest</span>
        {regular.map((_, i) => {
          const known = i < step.costs.length;
          return <span key={`c${i}`} className={`lane-cell lane-cell--best${known ? " lane-cell--known" : ""}${i === current ? " lane-cell--active" : ""}`}>{known ? step.costs[i] : "?"}</span>;
        })}
      </div>
      <dl className="lane-state" aria-label="Current line costs">
        <div><dt>Regular so far</dt><dd>{show(step.r)}</dd></div>
        <div><dt>Express so far</dt><dd>{show(step.e)}</dd></div>
        <div><dt>Answer</dt><dd>{reachedR ? reachedR.join(", ") : "pending"}</dd></div>
      </dl>
    </section>
  );
}
