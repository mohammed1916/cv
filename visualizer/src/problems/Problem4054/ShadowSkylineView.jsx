import "./ShadowSkylineView.css";

export default function ShadowSkylineView({ run, step }) {
  if (!run || !step) {
    return <section className="ss-view"><p className="ss-empty">Press Play to scan right from each anchor bar.</p></section>;
  }
  const values = run.input;
  const max = Math.max(...values);
  const anchor = step.i;
  const scanned = step.j;
  const height = (v) => `${Math.max(6, (v / max) * 100)}%`;
  const levelBottom = anchor >= 0 ? height(values[anchor]) : null;
  return (
    <section className="ss-view" aria-label="Shadow pair skyline">
      <div className="ss-skyline">
        {anchor >= 0 && levelBottom && (
          <div className="ss-level" style={{ bottom: levelBottom }} aria-label={`anchor level ${values[anchor]}`}>
            <span>anchor {values[anchor]}</span>
          </div>
        )}
        {values.map((v, k) => {
          const role = k === anchor ? "anchor" : k === scanned ? (step.valid ? "pair" : "scan") : anchor >= 0 && k > anchor && (scanned < 0 || k < scanned) ? "passed" : "";
          return (
            <div key={k} className={`ss-col ss-col--${role || "idle"}`}>
              <span className="ss-value">{v}</span>
              <div className="ss-bar" style={{ height: height(v) }} title={`index ${k}, value ${v}`} />
              <span className="ss-index">{k}</span>
            </div>
          );
        })}
      </div>
      <p className="ss-note" role="status">
        {step.blocker !== null && step.blocker !== undefined ? `Smallest value passed so far: ${step.blocker}. ` : ""}
        Pairs counted: <strong>{step.count}</strong>
      </p>
    </section>
  );
}
