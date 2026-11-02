import "./PolynomialMergeView.css";

const fmt = ([c, p]) => `${c}x^${p}`;

function Row({ label, terms, activeIndex, pointerLabel, className = "" }) {
  return (
    <div className={`poly-row ${className}`}>
      <span className="poly-row-label">{label}</span>
      {terms.length === 0 && <span className="poly-message">(empty)</span>}
      {terms.map((term, index) => (
        <div key={index} className={`poly-term ${index === activeIndex ? "poly-term--active" : ""}`}>
          {index === activeIndex && <span className="poly-pointer">{pointerLabel}</span>}
          {fmt(term)}
          <small>coef {term[0]}</small>
        </div>
      ))}
    </div>
  );
}

// Two term lists with pointers i and j, and the result built so far.
export default function Problem1634View({ run, step }) {
  const { poly1, poly2 } = run.input;
  const terms1 = poly1.map(t => t);
  const terms2 = poly2.map(t => t);
  const merged = step.phase === "match";
  return (
    <section className="poly-view" aria-label="Adding two polynomials term by term">
      <Row label="poly1" terms={terms1} activeIndex={step.i < terms1.length ? step.i : -1} pointerLabel="i" />
      <Row label="poly2" terms={terms2} activeIndex={step.j < terms2.length ? step.j : -1} pointerLabel="j" />
      <div className={`poly-row poly-result`}>
        <span className="poly-row-label">result</span>
        {step.result.length === 0 && <span className="poly-message">(nothing yet)</span>}
        {step.result.map((term, index) => (
          <div key={index} className="poly-term">{fmt(term)}</div>
        ))}
        {merged && step.total === 0 && <div className="poly-term poly-term--dropped">0 dropped</div>}
      </div>
      <p className="poly-message">{step.message}</p>
    </section>
  );
}
