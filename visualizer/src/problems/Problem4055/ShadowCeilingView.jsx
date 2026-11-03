import "./ShadowCeilingView.css";

export default function ShadowCeilingView({ run, step }) {
  if (!run || !step) {
    return <section className="sc-view"><p className="sc-empty">Press Play to scan right, tracking the lowest value above each anchor.</p></section>;
  }
  const values = run.input;
  const max = Math.max(...values);
  const anchor = step.i;
  const scanned = step.j;
  const height = (v) => `${Math.max(6, (v / max) * 100)}%`;
  const levelBottom = anchor >= 0 ? height(values[anchor]) : null;
  return (
    <section className="sc-view" aria-label="Shadow pair ceiling">
      <div className="sc-skyline">
        {anchor >= 0 && levelBottom && (
          <div className="sc-level" style={{ bottom: levelBottom }} aria-label={`anchor level ${values[anchor]}`}>
            <span>anchor {values[anchor]}</span>
          </div>
        )}
        {anchor >= 0 && step.ceiling !== null && step.ceiling !== undefined && (
          <div className="sc-level sc-level--ceiling" style={{ bottom: height(step.ceiling) }} aria-label={`ceiling ${step.ceiling}`}>
            <span>ceiling {step.ceiling}</span>
          </div>
        )}
        {values.map((v, k) => {
          const role = k === anchor ? "anchor" : k === scanned ? (step.valid ? "pair" : "scan") : anchor >= 0 && k > anchor && (scanned < 0 || k < scanned) ? "passed" : "";
          return (
            <div key={k} className={`sc-col sc-col--${role || "idle"}`}>
              <span className="sc-value">{v}</span>
              <div className="sc-bar" style={{ height: height(v) }} title={`index ${k}, value ${v}`} />
              <span className="sc-index">{k}</span>
            </div>
          );
        })}
      </div>
      <p className="sc-note" role="status">
        {step.ceiling !== null && step.ceiling !== undefined ? `Lowest value above the anchor passed so far: ${step.ceiling}. A later value must not exceed it to pair. ` : ""}
        Pairs counted: <strong>{step.count}</strong>
      </p>
    </section>
  );
}
