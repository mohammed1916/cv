import "./CompactDecisionView.css";

// Each child is judged truthy (kept) or falsy (dropped); the output appears once the walk finishes.
export default function CompactDecisionView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="cd-view" aria-label="Compact decisions">
        <p className="cd-empty">Press Play to compact the value.</p>
      </section>
    );
  }
  const decisions = step.decisions ?? [];
  return (
    <section className="cd-view" aria-label="Compact decisions">
      <p className="cd-path" aria-label="Current path">at {step.path ?? "root"}</p>
      {decisions.length === 0 ? (
        <p className="cd-empty">No children judged yet.</p>
      ) : (
        <ul className="cd-list" aria-label="Decisions so far">
          {decisions.map((d, i) => (
            <li key={`${d.path}-${i}`} className={`cd-item ${d.kept ? "cd-item--kept" : "cd-item--dropped"}${d.path === step.path ? " cd-item--current" : ""}`}>
              <span className="cd-badge" aria-hidden="true">{d.kept ? "✓" : "✕"}</span>
              <code className="cd-path-text">{d.path}</code>
              <span className="cd-value">{JSON.stringify(d.value)}</span>
              <span className="cd-verdict">{d.kept ? "kept" : "dropped"}</span>
            </li>
          ))}
        </ul>
      )}
      {step.output !== undefined && (
        <pre className="cd-output" aria-label="Compacted output">{JSON.stringify(step.output, null, 2)}</pre>
      )}
    </section>
  );
}
