import "./RunStripView.css";

// The values sit in a strip. Between neighbours, an arrow shows the step: +1, -1, or a break.
// Two run boxes below track the rising and falling runs that end at the current position.
export default function RunStripView({ run, step }) {
  if (!run || !step) return <p className="rsv-empty">Press Play to follow the rising and falling runs.</p>;
  const nums = run.input;
  const i = step.i;

  return (
    <section className="rsv-view" aria-label="Consecutive subarray runs">
      <div className="rsv-strip" role="list" aria-label="Values in order">
        {nums.map((x, p) => (
          <div className="rsv-item" role="listitem" key={p}>
            {p > 0 && (
              <span className={`rsv-step${p === i && step.diff === 1 ? " rsv-step--up" : ""}${p === i && step.diff === -1 ? " rsv-step--down" : ""}${p === i && step.diff !== 1 && step.diff !== -1 ? " rsv-step--break" : ""}`}>
                {nums[p] - nums[p - 1] === 1 ? "+1" : nums[p] - nums[p - 1] === -1 ? "−1" : "✗"}
              </span>
            )}
            <div className={`rsv-cell${p === i ? " rsv-cell--current" : ""}`}>{x}</div>
          </div>
        ))}
      </div>
      <div className="rsv-runs">
        <div className="rsv-run rsv-run--up">
          <span className="rsv-run__label">Rising runs ending here (length 2+)</span>
          <strong>{step.upCount}</strong>
          <span>sum of sums {step.upSum}</span>
        </div>
        <div className="rsv-run rsv-run--down">
          <span className="rsv-run__label">Falling runs ending here (length 2+)</span>
          <strong>{step.downCount}</strong>
          <span>sum of sums {step.downSum}</span>
        </div>
        <div className="rsv-run rsv-run--total">
          <span className="rsv-run__label">Running total</span>
          <strong>{step.total}</strong>
          <span>{step.phase === "done" ? "after modulo" : "before modulo"}</span>
        </div>
      </div>
    </section>
  );
}
