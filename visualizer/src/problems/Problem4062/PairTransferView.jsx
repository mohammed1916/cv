import "./PairTransferView.css";

function ValueRow({ label, values, highlight, matchTarget }) {
  return (
    <div className="pt-row">
      <span className="pt-label">{label}</span>
      <ol className="pt-cells">
        {values.map((v, k) => {
          const pair = highlight && (k === highlight[0] || k === highlight[1]);
          const matched = matchTarget && matchTarget[k] === v;
          return (
            <li key={k} className={`pt-cell${pair ? " pt-cell--pair" : ""}${matched ? " pt-cell--match" : ""}`}>
              <span className="pt-value">{v}</span>
              <span className="pt-index">{k}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function PairTransferView({ run, step }) {
  if (!run || !step) {
    return <section className="pt-view"><p className="pt-empty">Press Play to watch each position receive its target value while the total stays fixed.</p></section>;
  }
  const { source, target } = run.input;
  const sameSum = step.sourceSum === step.targetSum;
  return (
    <section className="pt-view" aria-label="Pair transfers">
      <ValueRow label="source" values={source} />
      <ValueRow label="current" values={step.current} highlight={step.pair} matchTarget={target} />
      <ValueRow label="target" values={target} />
      <dl className="pt-sums">
        <div><dt>source sum</dt><dd>{step.sourceSum}</dd></div>
        <div><dt>target sum</dt><dd>{step.targetSum}</dd></div>
        <div><dt>status</dt><dd>{sameSum ? "equal totals" : "totals differ"}</dd></div>
      </dl>
      <p className="pt-caption" role="status">{step.message}</p>
    </section>
  );
}
