import "./DeepEqualTreeView.css";

function show(value) {
  if (value === undefined) return "undefined";
  return JSON.stringify(value);
}

export default function DeepEqualTreeView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="de-view" aria-label="JSON deep equal">
        <p className="de-empty">Press Play to walk both values side by side and see which comparison decides the answer.</p>
      </section>
    );
  }

  const view = step.view;
  const { o1, o2, a, b, path, result, log, done } = view;
  const verdict = result === null || result === undefined ? "checking" : result ? "equal" : "different";

  return (
    <section className="de-view" aria-label="JSON deep equal comparison">
      <header className="de-head">
        <strong>Comparing at <code>{path}</code></strong>
        <span className={`de-badge de-badge--${verdict}`}>
          {verdict === "equal" ? "= equal" : verdict === "different" ? "≠ different" : "checking"}
        </span>
      </header>

      <div className="de-pair">
        <figure className="de-box" aria-label="First value">
          <figcaption>o1</figcaption>
          <pre>{show(done ? o1 : a)}</pre>
        </figure>
        <div className="de-sign" aria-hidden="true">{verdict === "equal" ? "=" : verdict === "different" ? "≠" : "?"}</div>
        <figure className="de-box" aria-label="Second value">
          <figcaption>o2</figcaption>
          <pre>{show(done ? o2 : b)}</pre>
        </figure>
      </div>

      <div className="de-tree" aria-label="Comparisons so far">
        <h4>Comparisons so far</h4>
        {log.length === 0 && <p className="de-empty">No comparisons yet.</p>}
        <ol>
          {log.map((entry, index) => (
            <li key={index} className={entry.result ? "de-row de-row--ok" : "de-row de-row--bad"} style={{ marginLeft: `${Math.min(entry.depth, 4) * 14}px` }}>
              <span className="de-kind">{entry.kind === "value" ? "value" : entry.kind === "shape" ? "shape" : entry.kind}</span>
              <code>{entry.path}</code>
              <span className="de-result">{entry.result ? "equal" : "differs"}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
