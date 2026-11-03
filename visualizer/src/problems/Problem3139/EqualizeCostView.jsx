import "./EqualizeCostView.css";

export default function EqualizeCostView({ run, step }) {
  const { nums, cost1, cost2 } = run.input;
  const peak = Math.max(step.target ?? 0, ...nums, 1);
  const barHeight = (value) => `${Math.max(4, Math.round((value / peak) * 100))}%`;
  const deficits = step.deficits;

  return (
    <div className="equalize-view" aria-label="Equalize cost visual">
      <div className="equalize-view__chart" role="img" aria-label={`Values ${nums.join(", ")}${step.target !== null ? `, target ${step.target}` : ""}`}>
        {nums.map((value, i) => {
          const deficit = deficits ? deficits[i] : 0;
          return (
            <div key={i} className="equalize-view__column">
              <div className="equalize-view__stack" style={{ height: barHeight(step.target ?? value) }}>
                {deficit > 0 && (
                  <div className="equalize-view__deficit" style={{ height: `${Math.round((deficit / (step.target ?? peak)) * 100)}%` }}>
                    +{deficit}
                  </div>
                )}
                <div className="equalize-view__base" style={{ height: `${Math.round((value / (step.target ?? peak)) * 100)}%` }}>
                  <span>{value}</span>
                </div>
              </div>
              <span className="equalize-view__index">#{i}</span>
            </div>
          );
        })}
        {step.target !== null && (
          <div className="equalize-view__target" style={{ bottom: `${Math.round((step.target / peak) * 100)}%` }}>
            target {step.target}
          </div>
        )}
      </div>

      <dl className="equalize-view__facts">
        <div><dt>Total units</dt><dd>{step.total ?? "-"}</dd></div>
        <div><dt>Largest deficit</dt><dd>{step.biggest ?? "-"}</dd></div>
        <div><dt>Pairs that fit</dt><dd>{step.pairs ?? "-"}</dd></div>
        <div><dt>Singles only (cost1 = {cost1})</dt><dd>{step.singlesOnly !== null ? String(step.singlesOnly) : "-"}</dd></div>
        <div><dt>With pairs (cost2 = {cost2})</dt><dd>{step.paired !== null ? String(step.paired) : "-"}</dd></div>
        <div><dt>Best so far</dt><dd>{step.best !== null ? String(step.best) : "none yet"}{step.bestTarget !== null ? ` at target ${step.bestTarget}` : ""}</dd></div>
      </dl>
      <p className="equalize-view__message">{step.message}</p>
    </div>
  );
}
