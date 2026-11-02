import "./SubsetCostView.css";

// Top: the element being considered and every value it can reach with its operation cost.
// Bottom: the cheapest cost to reach each sum 0..target. Cells changed by this element glow.
export default function SubsetCostView({ run, step }) {
  if (!run || !step) {
    return <section className="sc-view" aria-label="Subset sum costs"><p className="sc-empty">Press Play to build the cost table one element at a time.</p></section>;
  }
  const { nums, sum } = run;
  const changed = new Set(step.changed);
  const cells = Array.from({ length: sum + 1 }, (_, s) => s);
  const doneCount = step.index + 1;
  return (
    <section className="sc-view" aria-label="Operation costs by subset sum">
      <div className="sc-elements" aria-label="Elements">
        {nums.map((value, i) => (
          <span key={i} className={`sc-el ${i === step.index ? "sc-el--now" : i < doneCount && step.index >= 0 ? "sc-el--used" : ""}`}>
            {value}
          </span>
        ))}
      </div>
      {step.index >= 0 && step.options.length > 0 && (
        <div className="sc-options" aria-label={`Reachable values for ${step.v}`}>
          <h4>Reachable from {step.v}</h4>
          <div className="sc-chips">
            {step.options.map(o => (
              <span key={o.w} className="sc-chip">
                <b>{o.w}</b> <span>cost {o.cost}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="sc-table-wrap">
        <table className="sc-table" aria-label="Cheapest cost for each sum">
          <thead>
            <tr>
              <th scope="col">sum</th>
              {cells.map(s => <th key={s} scope="col">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">cost</th>
              {cells.map(s => {
                const value = step.best[s];
                const cls = ["sc-cell", value === null ? "sc-cell--inf" : "", changed.has(s) ? "sc-cell--changed" : "", s === sum ? "sc-cell--target" : ""].join(" ");
                return <td key={s} className={cls}>{value === null ? "∞" : value}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="sc-status">
        Target sum <b>{sum}</b>: cost {step.best[sum] === null ? "∞ so far" : step.best[sum]}.
        {step.phase === "done" && <> Final answer {run.answer}.</>}
      </p>
    </section>
  );
}
