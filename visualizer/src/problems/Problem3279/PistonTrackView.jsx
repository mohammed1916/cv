import "./PistonTrackView.css";

// Each piston is a vertical rail from 0 (bottom) to height (top). A dot marks its position at the
// current time. The meter on the right compares the current total area with the best seen so far.
export default function PistonTrackView({ run, step }) {
  if (!run || !step) return <p className="ptv-empty">Press Play to sweep through one full cycle of the pistons.</p>;
  const { height, directions } = run.input;
  const unit = 22;
  const railHeight = height * unit;
  const shownT = step.t < 0 ? 0 : Math.min(step.t, step.period - 1);
  const maxArea = Math.max(1, run.frames.reduce((m, f) => Math.max(m, f.total), 0), height * 8 * 2);

  return (
    <section className="ptv-view" aria-label="Piston positions over time">
      <div className="ptv-rails">
        {step.positions.map((p, i) => (
          <div className="ptv-rail-wrap" key={i}>
            <span className="ptv-dir">{directions[i] === "up" ? "moving up" : "moving down"}</span>
            <div className="ptv-rail" style={{ height: railHeight + 20 }}>
              <div className="ptv-rail__line" style={{ height: railHeight }} />
              <div className="ptv-dot" style={{ bottom: p * unit + 3 }} aria-label={`Piston ${i} at ${p}`} />
              <span className="ptv-pos" style={{ bottom: p * unit + 2 }}>{p}</span>
            </div>
            <span className="ptv-label">P{i}</span>
          </div>
        ))}
        <div className="ptv-meter" aria-label="Total area meter">
          <div className="ptv-meter__track">
            <div className="ptv-meter__fill" style={{ height: `${Math.min(100, (step.total / maxArea) * 100)}%` }} />
            <div className="ptv-meter__best" style={{ bottom: `${Math.min(100, (step.best / maxArea) * 100)}%` }} />
          </div>
          <span className="ptv-label">total {step.total}</span>
          <span className="ptv-label">best {step.best}</span>
        </div>
      </div>
      <p className="ptv-time">
        {step.t < 0 ? "Before the sweep" : step.phase === "done" ? `Cycle complete at time ${step.period}` : `Time t = ${shownT} of ${step.period - 1}`}
      </p>
    </section>
  );
}
