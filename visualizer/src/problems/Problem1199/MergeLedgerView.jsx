import "./MergeLedgerView.css";

// Left: the pool of workers, smallest first. Each merge takes the two smallest, and the pair finishes at
// the slower time plus the split. Right: the merge ledger, one row per merge, forming a tree bottom-up.
export default function MergeLedgerView({ run, step }) {
  if (!run || !step) return null;
  const { split } = run.input;
  const merges = step.merges || [];
  const activeIndex = step.phase === "merge" ? merges.length - 1 : -1;
  return (
    <div className="ml-view">
      <section className="ml-pool" aria-label="Pool of workers">
        <h3 className="ml-title">pool (smallest first)</h3>
        <ol className="ml-chips">
          {(step.pool || []).map((value, index) => (
            <li key={`${value}-${index}`} className={`ml-chip${index === 0 ? " ml-chip--min" : ""}${step.phase === "merge" && index === step.pool.indexOf(step.merged) ? " ml-chip--new" : ""}`}>
              {value}
            </li>
          ))}
        </ol>
        <p className="ml-split">split time {split}</p>
      </section>

      <section className="ml-ledger" aria-label="Merge ledger">
        <h3 className="ml-title">merges</h3>
        {merges.length === 0 && <p className="ml-empty">No merges yet: one block takes its own time.</p>}
        <ol className="ml-rows">
          {merges.map((merge, index) => (
            <li key={index} className={`ml-row${index === activeIndex ? " ml-row--current" : ""}`}>
              <span className="ml-row__n">{index + 1}</span>
              <span className="ml-row__pair">
                <b>{merge.first}</b> + <b>{merge.second}</b>
              </span>
              <span aria-hidden="true">→</span>
              <span className="ml-row__result">{merge.second} + {split} = <b>{merge.merged}</b></span>
            </li>
          ))}
        </ol>
      </section>

      <output aria-label="Minimum build time">{step.phase === "done" ? `answer ${step.answer}` : "answer pending"}</output>
    </div>
  );
}
