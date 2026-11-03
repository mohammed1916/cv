import "./BraceExpansionView.css";

// Draws the groups as columns of option chips, the prefix being built, and the result list.
export default function BraceExpansionView({ run, step }) {
  if (!run || !step) return <p className="brace-view__empty">Run the trace to see the groups.</p>;
  const groups = step.groups || [];
  const prefix = step.prefix || "";
  const depth = step.depth ?? -1;
  const results = step.results || [];

  return (
    <div className="brace-view">
      <section aria-label="Groups" className="brace-view__section">
        <h3 className="brace-view__heading">Groups in order</h3>
        <div className="brace-view__groups">
          {groups.map((group, k) => {
            const deciding = k === depth;
            const fixed = prefix[k];
            return (
              <div key={k} className={`brace-view__group${deciding ? " is-deciding" : ""}`}>
                <div className="brace-view__group-label">Group {k + 1} {group.display}</div>
                <ul className="brace-view__options">
                  {group.options.map((option) => {
                    const trying = deciding && step.option === option;
                    const chosen = fixed === option;
                    const cls = ["brace-view__chip", trying ? "is-trying" : "", chosen ? "is-chosen" : ""].join(" ").trim();
                    return <li key={option} className={cls}>{option}{trying ? " (trying)" : chosen ? " (set)" : ""}</li>;
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Prefix" className="brace-view__section">
        <h3 className="brace-view__heading">Prefix built so far</h3>
        <div className="brace-view__prefix">
          {prefix.length === 0 && <span className="brace-view__none">empty</span>}
          {[...prefix].map((ch, i) => <span key={i} className="brace-view__tile">{ch}</span>)}
          {step.option && <span className="brace-view__tile is-pending" aria-label="Pending letter">{step.option}</span>}
        </div>
      </section>

      <section aria-label="Results" className="brace-view__section">
        <h3 className="brace-view__heading">Results ({results.length})</h3>
        <ol className="brace-view__results">
          {results.map((word, i) => (
            <li key={`${word}-${i}`} className={`brace-view__result${i === step.emitted ? " is-new" : ""}`}>{word}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
