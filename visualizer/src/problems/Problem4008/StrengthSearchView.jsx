import "./StrengthSearchView.css";

export default function StrengthSearchView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ss-view" aria-label="Minimum initial strength">
        <p className="ss-empty">Press Play to binary search the starting strength and replay each check.</p>
      </section>
    );
  }

  const { strengths, boosts } = run.input;
  const top = Math.max(1, step.high);
  const pct = value => `${Math.min(100, (100 * value) / top)}%`;
  const bonusFor = i => boosts.reduce((sum, [l, r, v]) => (l <= i && i <= r ? sum + v : sum), 0);

  return (
    <section className="ss-view" aria-label="Minimum initial strength">
      <div className="ss-range" role="img" aria-label={`answer between ${step.low} and ${step.high}`}>
        <div className="ss-range__fill" style={{ left: 0, width: pct(step.high) }} />
        <div className="ss-range__lo" style={{ left: pct(step.low) }} />
        {step.probe !== null && <div className="ss-range__probe" style={{ left: pct(step.probe) }} aria-label={`probe ${step.probe}`} />}
      </div>
      <p className="ss-caption">Answer between {step.low} and {step.high}{step.probe !== null ? `, testing ${step.probe}` : ""}</p>
      <ol className="ss-monsters" aria-label="Monsters in order">
        {strengths.map((need, i) => {
          const active = step.monster === i;
          const bonus = bonusFor(i);
          return (
            <li key={i} className={`ss-monster${active ? " ss-monster--active" : ""}${active && step.ok === false ? " ss-monster--fail" : ""}`}>
              <span className="ss-monster__need">need {need}</span>
              {bonus > 0 && <span className="ss-monster__boost">+{bonus} boost</span>}
              {active && <span className="ss-monster__now">current {step.current}</span>}
            </li>
          );
        })}
      </ol>
      <p className="ss-status">{step.message}</p>
    </section>
  );
}
