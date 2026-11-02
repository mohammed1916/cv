import "./HenReachView.css";

const HEN_COLORS = ["hr-hen-0", "hr-hen-1", "hr-hen-2", "hr-hen-3", "hr-hen-4", "hr-hen-5"];

function pct(value, max) {
  return max <= 0 ? 0 : (value / max) * 100;
}

export default function HenReachView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="hr-view" aria-label="Hens and grains">
        <p className="hr-empty">Press Play to watch hens take runs of grains while the time shrinks.</p>
      </section>
    );
  }

  const view = step.view;
  const { hens, grains, lo, hi, mid, segments, feasible, current, answer } = view;
  const max = Math.max(1, ...hens, ...grains, mid ?? 0);
  const ownerOf = index => segments.find(seg => index >= seg.start && index < seg.end);
  const reachHen = current !== null && current !== undefined ? hens[current] : null;

  return (
    <section className="hr-view" aria-label="Minimum time to eat all grains">
      <header className="hr-head">
        <strong>{mid !== null && mid !== undefined ? `Testing time ${mid}` : answer !== undefined ? `Answer ${answer}` : "Sorted positions"}</strong>
        {feasible !== null && feasible !== undefined && (
          <span className={feasible ? "hr-badge hr-badge--ok" : "hr-badge hr-badge--fail"}>
            {feasible ? "every grain taken" : "grains left over"}
          </span>
        )}
      </header>

      <div className="hr-track" role="img" aria-label={`Number line from 0 to ${max}`}>
        {mid !== null && mid !== undefined && reachHen !== null && (
          <div
            className="hr-reach"
            style={{ left: `${pct(Math.max(0, reachHen - mid), max)}%`, width: `${pct(Math.min(max, reachHen + mid) - Math.max(0, reachHen - mid), max)}%` }}
            title={`Hen ${current + 1} can reach ${Math.max(0, reachHen - mid)} to ${reachHen + mid} in time ${mid}`}
          >
            <span>reach of hen {current + 1}</span>
          </div>
        )}

        <div className="hr-axis" />
        {segments.map(seg => seg.end > seg.start && (
          <div
            key={`bar-${seg.hen}`}
            className={`hr-bar ${HEN_COLORS[seg.hen % HEN_COLORS.length]}`}
            style={{ left: `${pct(grains[seg.start], max)}%`, width: `${pct(grains[seg.end - 1] - grains[seg.start], max)}%` }}
            title={`Hen ${seg.hen + 1} eats grains ${grains.slice(seg.start, seg.end).join(", ")} in ${seg.cost}`}
          />
        ))}

        {grains.map((position, index) => {
          const owner = ownerOf(index);
          const cls = owner ? HEN_COLORS[owner.hen % HEN_COLORS.length] : feasible === false || segments.length === 0 ? "hr-grain--open" : "hr-grain--idle";
          return (
            <div key={`g-${index}`} className={`hr-grain ${cls}`} style={{ left: `${pct(position, max)}%` }} title={`grain at ${position}`}>
              <span>{position}</span>
            </div>
          );
        })}

        {hens.map((position, index) => (
          <div
            key={`h-${index}`}
            className={`hr-hen ${HEN_COLORS[index % HEN_COLORS.length]} ${current === index ? "hr-hen--active" : ""}`}
            style={{ left: `${pct(position, max)}%` }}
            title={`Hen ${index + 1} at ${position}`}
          >
            <b>H{index + 1}</b>
          </div>
        ))}
      </div>

      <div className="hr-search" aria-label="Search range for the time">
        <div className="hr-search__track">
          <div className="hr-search__range" style={{ left: `${pct(lo, hi || 1)}%`, width: `${pct(hi - lo, hi || 1)}%` }} />
          {mid !== null && mid !== undefined && (
            <div className="hr-search__mid" style={{ left: `${pct(mid, hi || 1)}%` }}>{mid}</div>
          )}
        </div>
        <div className="hr-search__labels">
          <span>low {lo ?? "-"}</span>
          <span>high {hi ?? "-"}</span>
        </div>
      </div>

      {segments.length > 0 && (
        <table className="hr-table">
          <thead>
            <tr><th>Hen</th><th>At</th><th>Grains taken</th><th>Walk time</th></tr>
          </thead>
          <tbody>
            {segments.map(seg => (
              <tr key={seg.hen} className={current === seg.hen ? "hr-row--active" : ""}>
                <td><span className={`hr-chip ${HEN_COLORS[seg.hen % HEN_COLORS.length]}`}>H{seg.hen + 1}</span></td>
                <td>{seg.position}</td>
                <td>{seg.end > seg.start ? grains.slice(seg.start, seg.end).join(", ") : "none"}</td>
                <td>{seg.cost === null ? "-" : `${seg.cost}${mid !== null && mid !== undefined && seg.cost <= mid ? " ≤ " + mid : ""}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
