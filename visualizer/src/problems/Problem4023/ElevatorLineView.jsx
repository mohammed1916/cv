import "./ElevatorLineView.css";

export default function ElevatorLineView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="el-view" aria-label="Elevator requests on a line">
        <p className="el-empty">Press Play to grow the visited floors outward from the start.</p>
      </section>
    );
  }

  const { start, floors } = run.input;
  const pts = step.pts;
  const lo = pts[0];
  const hi = pts[pts.length - 1];
  const span = Math.max(1, hi - lo);
  const x = floor => `${(100 * (floor - lo)) / span}%`;
  const [i, j] = step.interval;
  const requested = new Set(floors);

  return (
    <section className="el-view" aria-label="Elevator requests on a line">
      <div className="el-line" role="img" aria-label={`Visited floors ${pts[i]} to ${pts[j]}`}>
        <div className="el-line__base" />
        <div className="el-line__visited" style={{ left: x(pts[i]), width: `${(100 * (pts[j] - pts[i])) / span}%` }} />
        {pts.map((p) => (
          <div key={p} className="el-stop" style={{ left: x(p) }}>
            <span className={`el-dot${p === start ? " el-dot--start" : requested.has(p) ? " el-dot--request" : ""}${p === step.pts[i] && step.side === 0 ? " el-dot--end" : ""}${p === step.pts[j] && step.side === 1 ? " el-dot--end" : ""}`} />
            <span className="el-label">{p}{p === start ? " start" : ""}</span>
          </div>
        ))}
      </div>
      <dl className="el-cards">
        <div><dt>Interval</dt><dd>{pts[i]} to {pts[j]}</dd></div>
        <div><dt>Cost so far</dt><dd>{step.cost}</dd></div>
        <div><dt>Waiting outside</dt><dd>{step.pending}</dd></div>
      </dl>
      <p className="el-status">{step.message}</p>
      <p className="el-caption">Best costs kept in the table: {step.states.length} states.</p>
    </section>
  );
}
