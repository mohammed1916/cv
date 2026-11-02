import "./FairCandidatesView.css";

// Digits of the current candidate, each tagged odd or even, with the tally that decides fairness.
export default function FairCandidatesView({ run, step }) {
  if (!run || !step) {
    return <section className="fair-view" aria-label="Fair candidates"><p className="fair-empty">Press Play to test candidates.</p></section>;
  }
  return (
    <section className="fair-view" aria-label="Fair candidates">
      <p className="fair-start">Start n = <strong>{run.input}</strong>. Candidate <strong>{step.candidate}</strong></p>
      <div className="fair-digits" aria-label="Digits">
        {step.digits.length === 0 ? <span className="fair-digit fair-digit--idle">no digits yet</span> : step.digits.map((d, i) => (
          <span key={i} className={`fair-digit ${d % 2 ? "fair-digit--odd" : "fair-digit--even"}`}>
            <span className="fair-digit__value">{d}</span>
            <span className="fair-digit__tag">{d % 2 ? "odd" : "even"}</span>
          </span>
        ))}
      </div>
      <dl className="fair-tally">
        <div><dt>Odd digits</dt><dd>{step.odd}</dd></div>
        <div><dt>Even digits</dt><dd>{step.even}</dd></div>
        <div><dt>Verdict</dt><dd>{step.phase === "found" ? "fair: answer" : step.digits.length ? "not fair" : "waiting"}</dd></div>
      </dl>
      <p className="fair-note">Fair means equal counts. An odd number of digits can never be fair.</p>
    </section>
  );
}
