import "./FencePairView.css";

export default function FencePairView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="fp-view" aria-label="Widest possible fence">
        <p className="fp-empty">Press Play to test each candidate height against the originals.</p>
      </section>
    );
  }

  const heights = run.input.heights;
  const counts = new Map();
  for (const h of heights) counts.set(h, (counts.get(h) || 0) + 1);
  const maxCount = Math.max(1, ...counts.values());
  const candidate = step.candidate;

  return (
    <section className="fp-view" aria-label="Widest possible fence">
      <div className="fp-originals" role="list" aria-label="Original planks">
        {heights.map((h, i) => (
          <span key={i} role="listitem" className={`fp-plank${h === candidate ? " fp-plank--single" : ""}`}>
            {h}
          </span>
        ))}
      </div>
      <p className="fp-caption">
        {candidate === null ? "Candidate heights are every original height and every sum of two originals." : `Candidate height ${candidate}`}
      </p>
      {candidate !== null && (
        <dl className="fp-cards">
          <div><dt>As singles</dt><dd>{step.singles}</dd></div>
          <div><dt>As pairs</dt><dd>{step.pairs}</dd></div>
          <div><dt>Planks</dt><dd>{step.total}</dd></div>
          <div><dt>Best so far</dt><dd>{step.best}{step.bestHeight !== null ? ` at ${step.bestHeight}` : ""}</dd></div>
        </dl>
      )}
      <ul className="fp-bars" aria-label="Count of each original height">
        {[...counts.entries()].sort((a, b) => a[0] - b[0]).map(([h, c]) => (
          <li key={h} className={h === candidate ? "fp-bar fp-bar--active" : "fp-bar"}>
            <span className="fp-bar__label">height {h}</span>
            <span className="fp-bar__track"><span className="fp-bar__fill" style={{ width: `${(100 * c) / maxCount}%` }} /></span>
            <span className="fp-bar__count">x{c}</span>
          </li>
        ))}
      </ul>
      <p className="fp-status">{step.message}</p>
    </section>
  );
}
