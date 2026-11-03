import "./MinOperationsPalindromicView.css";

const digitsOf = (n) => String(n).split("");

function Candidate({ label, value, x, chosen }) {
  if (value === null || value === undefined) return <span className="mop-chip mop-chip--none">{label}: none</span>;
  const cost = Math.abs(value - x) / 2;
  return (
    <span className={`mop-chip${chosen ? " mop-chip--chosen" : ""}`}>
      {label}: {value} ({cost} op{cost === 1 ? "" : "s"})
    </span>
  );
}

export default function MinOperationsPalindromicView({ run, step }) {
  if (!run || !step) {
    return <section className="mop-view"><p className="mop-empty">Press Play to move each element to its nearest palindrome of the same parity.</p></section>;
  }
  const values = run.input;
  const costs = step.costs || [];
  const current = step.index;
  return (
    <section className="mop-view" aria-label="Nearest same-parity palindromes">
      <ol className="mop-cards">
        {values.map((x, i) => {
          const done = i < costs.length;
          const isCurrent = i === current;
          return (
            <li key={i} className={`mop-card${isCurrent ? " mop-card--current" : ""}${done ? " mop-card--done" : ""}`}>
              <span className="mop-kind">{x % 2 === 0 ? "even" : "odd"}</span>
              <span className="mop-digits" aria-label={`element ${x}`}>
                {digitsOf(x).map((d, k) => <span key={k} className="mop-digit">{d}</span>)}
              </span>
              <span className="mop-cost">{done ? `cost ${costs[i]}` : "waiting"}</span>
            </li>
          );
        })}
      </ol>
      {current >= 0 && step.x !== null && (
        <div className="mop-ladder" aria-label="Candidates for the current element">
          <p>Element {step.x} steps to the nearest palindromes of its own parity:</p>
          <Candidate label="below" value={step.below} x={step.x} chosen={step.chosen === step.below} />
          <Candidate label="above" value={step.above} x={step.x} chosen={step.chosen === step.above} />
        </div>
      )}
      <p className="mop-total" role="status">Running total: <strong>{step.total}</strong> operations</p>
    </section>
  );
}
