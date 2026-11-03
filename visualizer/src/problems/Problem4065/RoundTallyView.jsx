import "./RoundTallyView.css";

export default function RoundTallyView({ run, step }) {
  if (!run || !step) {
    return <section className="rt-view"><p className="rt-empty">Press Play to remove one copy of each distinct value per round.</p></section>;
  }
  const counts = Array.isArray(step.counts) ? step.counts : [];
  const distinct = step.distinct || [];
  return (
    <section className="rt-view" aria-label="Rounds of removals">
      <div className="rt-block">
        <h3 className="rt-heading">Remaining copies{step.round ? ` (round ${step.round})` : ""}</h3>
        {counts.length === 0 ? (
          <p className="rt-none">Nothing remains.</p>
        ) : (
          <ul className="rt-counts">
            {counts.map(({ value, count }) => {
              const active = step.value === value;
              const inRound = distinct.includes(value);
              return (
                <li key={value} className={`rt-count${active ? " rt-count--active" : ""}${inRound ? " rt-count--round" : ""}`}>
                  <span className="rt-value">{value}</span>
                  <span className="rt-stack" aria-label={`${count} copies of ${value}`}>
                    {Array.from({ length: count }, (_, k) => <span key={k} className="rt-token" />)}
                  </span>
                  <span className="rt-number">×{count}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="rt-block">
        <h3 className="rt-heading">Answer so far</h3>
        <ol className="rt-answer">
          {(step.answer || []).map((v, k) => (
            <li key={k} className={k === (step.answer || []).length - 1 && step.value !== null ? "rt-answer--last" : ""}>{v}</li>
          ))}
        </ol>
      </div>
      <p className="rt-caption" role="status">{step.message}</p>
    </section>
  );
}
