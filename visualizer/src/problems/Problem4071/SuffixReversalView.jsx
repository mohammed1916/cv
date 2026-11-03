import "./SuffixReversalView.css";

export default function SuffixReversalView({ run, step }) {
  if (!run || !step) {
    return <section className="sr-view"><p className="sr-empty">Press Play to try reversing each suffix and keep the cheapest dial path.</p></section>;
  }
  const s = run.input;
  const k = step.k;
  const reversedFrom = k >= 0 && k <= s.length ? k : null;
  const preview = step.preview || s;
  return (
    <section className="sr-view" aria-label="Suffix reversal candidates">
      <div className="sr-row">
        <span className="sr-label">digits</span>
        <ol className="sr-cells">
          {[...s].map((ch, i) => {
            const inSuffix = reversedFrom !== null && i >= reversedFrom;
            return (
              <li key={i} className={`sr-cell${inSuffix ? " sr-cell--suffix" : ""}${reversedFrom === i ? " sr-cell--start" : ""}`}>
                <span className="sr-digit">{ch}</span>
                <span className="sr-index">{i}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="sr-row">
        <span className="sr-label">after reversing from {reversedFrom === null || reversedFrom >= s.length ? "none" : reversedFrom}</span>
        <ol className="sr-cells">
          {[...preview].map((ch, i) => (
            <li key={i} className={`sr-cell${reversedFrom !== null && i >= reversedFrom && reversedFrom < s.length ? " sr-cell--preview" : ""}`}>
              <span className="sr-digit">{ch}</span>
            </li>
          ))}
        </ol>
      </div>
      <dl className="sr-stats">
        <div><dt>candidate</dt><dd>{step.candidate === null || step.candidate === undefined ? "—" : step.candidate}</dd></div>
        <div><dt>best so far</dt><dd>{step.best === null || step.best === undefined ? "—" : step.best}</dd></div>
        <div><dt>prefix cost</dt><dd>{step.prefixCost}</dd></div>
      </dl>
      <p className="sr-caption" role="status">{step.message}</p>
    </section>
  );
}
