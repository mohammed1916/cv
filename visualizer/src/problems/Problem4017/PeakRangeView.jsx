import "./PeakRangeView.css";

export default function PeakRangeView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pk-view" aria-label="Subarrays containing a peak">
        <p className="pk-empty">Press Play to apply each query in order.</p>
      </section>
    );
  }

  const nums = step.nums;
  const max = Math.max(1, ...nums);
  const hasRange = step.left >= 0 && step.right >= 0;

  return (
    <section className="pk-view" aria-label="Subarrays containing a peak">
      <div className="pk-bars" role="img" aria-label="Array values with peaks marked">
        {nums.map((v, i) => {
          const inRange = hasRange && i >= step.left && i <= step.right;
          const cls = [
            "pk-bar",
            step.peak[i] ? "pk-bar--peak" : "",
            inRange ? "pk-bar--range" : "",
            step.x === i ? "pk-bar--scan" : "",
            step.changed === i ? "pk-bar--changed" : "",
          ].join(" ");
          return (
            <div key={i} className={cls}>
              <span className="pk-value">{v}</span>
              <span className="pk-fill" style={{ height: `${(100 * v) / max}%` }} />
              <span className="pk-index">{i}{step.peak[i] ? " peak" : ""}</span>
            </div>
          );
        })}
      </div>
      <dl className="pk-cards">
        <div><dt>Range</dt><dd>{hasRange ? `${step.left}..${step.right}` : "-"}</dd></div>
        <div><dt>Start x</dt><dd>{step.x >= 0 ? step.x : "-"}</dd></div>
        <div><dt>Nearest peak</dt><dd>{step.nearest >= 0 ? step.nearest : "-"}</dd></div>
        <div><dt>Count</dt><dd>{step.count === null ? "-" : step.count}</dd></div>
      </dl>
      <p className="pk-answers">Answers so far: [{step.answers.join(", ")}]</p>
      <p className="pk-status">{step.message}</p>
    </section>
  );
}
