import "./DuplicateListView.css";

// The input list with a count badge per node; the pass-2 node under the pointer is blue, then green (kept) or red (dropped).
export default function Problem1836View({ run, step }) {
  const values = run.input;
  const cls = (i) => {
    if (step.phase === "count" && i === step.index) return "dup-node dup-node--current";
    if (i === step.index && step.phase === "keep") return "dup-node dup-node--keep";
    if (i === step.index && step.phase === "drop") return "dup-node dup-node--drop";
    return "dup-node";
  };
  const counted = step.phase === "count" ? step.index + 1 : values.length;
  return (
    <section className="dup-view" aria-label="Unsorted linked list with duplicate counts">
      <div className="dup-list" aria-label="Input list">
        {values.map((v, i) => (
          <div key={i} className={cls(i)}>
            {i < counted && step.counts[v] !== undefined && <span className="dup-badge">{step.counts[v]}</span>}
            {v}
            <small>node {i}</small>
          </div>
        ))}
        {values.length === 0 && <span className="dup-message">(empty list)</span>}
      </div>
      <div className="dup-result" aria-label="Result list">
        <span className="dup-label">result</span>
        {step.kept.length === 0 && <span className="dup-message">(nothing kept yet)</span>}
        {step.kept.map((v, i) => <div key={i} className="dup-node dup-node--keep">{v}</div>)}
      </div>
      <p className="dup-message">{step.message}</p>
    </section>
  );
}
