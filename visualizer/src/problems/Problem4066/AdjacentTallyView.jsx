import "./AdjacentTallyView.css";

export default function AdjacentTallyView({ run, step }) {
  if (!run || !step) {
    return <section className="at-view"><p className="at-empty">Press Play to walk the adjacent pairs and tally the distinct ones.</p></section>;
  }
  const values = run.input;
  const pairs = step.pairs || [];
  const current = step.index;
  const bestCount = step.best || 0;
  return (
    <section className="at-view" aria-label="Adjacent pairs">
      <ol className="at-strip">
        {values.map((v, k) => (
          <li key={k} className={`at-value${current >= 0 && (k === current || k === current + 1) ? " at-value--pair" : ""}`}>
            <span>{v}</span>
            <span className="at-index">{k}</span>
          </li>
        ))}
      </ol>
      <div className="at-stats">
        <p>Equal adjacent pairs: <strong>{step.equal}</strong></p>
        <p>Best distinct pair tally: <strong>{bestCount}</strong></p>
      </div>
      {pairs.length > 0 ? (
        <table className="at-table" aria-label="Tally of distinct adjacent pairs">
          <thead><tr><th>pair</th><th>adjacent count</th></tr></thead>
          <tbody>
            {pairs.map(({ pair, count }) => {
              const top = step.phase === "best" || step.phase === "done" ? count === bestCount : false;
              return (
                <tr key={pair.join(",")} className={top ? "at-table--top" : ""}>
                  <td>{`{${pair.join(", ")}}`}</td>
                  <td>{count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="at-none">No distinct adjacent pair yet.</p>
      )}
      <p className="at-caption" role="status">{step.message}</p>
    </section>
  );
}
