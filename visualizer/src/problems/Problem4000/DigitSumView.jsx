import "./DigitSumView.css";

export default function DigitSumView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ds-view" aria-label="Largest integer with a digit sum">
        <p className="ds-empty">Press Play to fill the digits from the left, nine at a time.</p>
      </section>
    );
  }

  const { n, s } = run.input;
  const digits = step.digits || [];
  const placed = s - step.remaining;

  return (
    <section className="ds-view" aria-label="Largest integer with a digit sum">
      <p className="ds-target">Digit sum {s} across {n} positions</p>
      <div className="ds-row">
        {Array.from({ length: n }, (_, i) => {
          const isSet = i < digits.length;
          const isActive = step.at === i;
          return (
            <div key={i} className={`ds-cell${isSet ? " ds-cell--set" : ""}${isActive ? " ds-cell--active" : ""}`}>
              <span className="ds-digit">{isSet ? digits[i] : "-"}</span>
              <span className="ds-caption">position {i + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="ds-meter" role="img" aria-label={`${placed} of ${s} placed`}>
        <div className="ds-meter__fill" style={{ width: `${s === 0 ? 100 : (100 * placed) / s}%` }} />
      </div>
      <p className="ds-status">
        {step.result === -1
          ? "The sum is too large for this many digits, so the answer is -1."
          : `${step.remaining} still to place${step.result !== undefined && step.result !== null ? `. Result ${step.result}.` : "."}`}
      </p>
    </section>
  );
}
