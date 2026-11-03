import "./MeetingTimelineView.css";

export default function MeetingTimelineView({ run, step }) {
  if (!run || !step) {
    return <section className="mt-view"><p className="mt-empty">Press Play to sweep meetings by start time and watch the best earlier chain.</p></section>;
  }
  const meetings = run.input;
  const lo = Math.min(...meetings.map((m) => m[0]));
  const hi = Math.max(...meetings.map((m) => m[1]));
  const span = Math.max(1, hi - lo);
  const pct = (t) => `${((t - lo) / span) * 100}%`;
  const order = meetings.map((_, k) => k).sort((x, y) => meetings[x][0] - meetings[y][0] || x - y);
  const pool = new Set(step.pool || []);
  const dp = step.dp || [];
  return (
    <section className="mt-view" aria-label="Meeting timeline">
      <ol className="mt-rows">
        {order.map((k) => {
          const [start, end, revenue] = meetings[k];
          const isCurrent = step.current === k;
          const isFrom = step.from === k;
          const cls = ["mt-row"];
          if (isCurrent) cls.push("mt-row--current");
          if (pool.has(k)) cls.push("mt-row--pool");
          if (isFrom) cls.push("mt-row--from");
          return (
            <li key={k} className={cls.join(" ")}>
              <span className="mt-name">#{k} rev {revenue}</span>
              <div className="mt-track">
                <div className="mt-bar" style={{ left: pct(start), width: `${((end - start) / span) * 100}%` }}>
                  <span>{start}–{end}</span>
                </div>
              </div>
              <span className="mt-dp">{dp[k] === null || dp[k] === undefined ? "—" : `dp ${dp[k]}`}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-caption" role="status">
        {step.message}{step.best !== null && step.best !== undefined ? ` Best finished value (dp minus end, plus start): ${step.best}.` : ""}
      </p>
      <p className="mt-legend">Blue bars are the current meeting. Green marks finished meetings in the pool. Amber marks the chosen predecessor. Gaps between meetings add to earnings.</p>
    </section>
  );
}
