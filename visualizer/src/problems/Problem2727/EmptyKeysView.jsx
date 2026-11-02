import "./EmptyKeysView.css";

// Shows the value's keys or elements as chips, a count, and the verdict.
export default function EmptyKeysView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ek-view" aria-label="Empty check">
        <p className="ek-empty">Press Play to count the keys or elements.</p>
      </section>
    );
  }
  const isList = Array.isArray(run.input);
  const items = step.items ?? [];
  const verdict = step.result === undefined ? null : step.result;
  return (
    <section className="ek-view" aria-label="Empty check">
      <p className="ek-kind">{isList ? "List: counting elements" : "Object: counting own keys"}</p>
      <div className="ek-box" aria-label={`${items.length} entries`}>
        {items.length === 0 ? <span className="ek-none">nothing inside</span> : items.map((item, i) => (
          <span key={i} className="ek-chip">{isList ? JSON.stringify(item) : item}</span>
        ))}
      </div>
      <output className={`ek-count${verdict === null ? "" : verdict ? " ek-count--yes" : " ek-count--no"}`} aria-label="Count and verdict">
        count {step.count ?? "?"}{verdict === null ? "" : verdict ? " : empty" : " : not empty"}
      </output>
    </section>
  );
}
