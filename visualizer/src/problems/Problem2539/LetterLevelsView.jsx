import "./LetterLevelsView.css";

// Letter bars with their counts. At each level k, each letter's term C(count, k) sits beside its bar.
export default function LetterLevelsView({ run, step }) {
  if (!run || !step) {
    return <section className="letter-view" aria-label="Letter counts"><p className="letter-empty">Press Play to count the letters and walk the levels.</p></section>;
  }
  const max = Math.max(...step.counts, 1);
  return (
    <section className="letter-view" aria-label="Letter counts">
      <ul className="letter-bars">
        {step.letters.map((c, i) => {
          const term = step.terms[i];
          return (
            <li key={c} className="letter-row">
              <span className="letter-name">{c}</span>
              <span className="letter-bar" style={{ width: `${(step.counts[i] / max) * 100}%` }} aria-label={`${c} appears ${step.counts[i]} times`} />
              <span className="letter-count">×{step.counts[i]}</span>
              {step.k !== null && <span className={`letter-term${term ? " letter-term--on" : ""}`}>1 + C({step.counts[i]}, {step.k}) = {1 + term}</span>}
            </li>
          );
        })}
      </ul>
      <dl className="letter-state">
        <div><dt>Level k</dt><dd>{step.k ?? "-"}</dd></div>
        <div><dt>Product</dt><dd>{step.ways ?? "-"}</dd></div>
        <div><dt>Total so far</dt><dd>{step.total}</dd></div>
      </dl>
      <p className="letter-note">A subsequence uses letters that each appear exactly k times. The level product counts every such choice, including the empty one that is removed.</p>
    </section>
  );
}
