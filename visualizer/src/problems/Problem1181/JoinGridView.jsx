import { Fragment } from "react";
import "./JoinGridView.css";

// A join grid: row i is the phrase that comes first (its last word is shown), column j is the phrase that
// comes second (its first word is shown). A cell lights up when the two words match; the current pair is ringed.
export default function JoinGridView({ run, step }) {
  if (!run || !step) return null;
  const phrases = run.input;
  const words = phrases.map((phrase) => phrase.split(" "));
  const n = phrases.length;
  const lastOf = (index) => words[index][words[index].length - 1];
  const firstOf = (index) => words[index][0];
  return (
    <div className="jg-view">
      <div className="jg-grid" style={{ gridTemplateColumns: `minmax(92px, auto) repeat(${n}, minmax(44px, 1fr))` }}
        role="table" aria-label="Join grid of last words against first words">
        <span className="jg-corner" role="columnheader">first ↓ / last →</span>
        {phrases.map((_, j) => (
          <span key={`c${j}`} className={`jg-head jg-head--col${step.j === j ? " jg-head--active" : ""}`} role="columnheader">
            <b>#{j}</b><small>{firstOf(j)}</small>
          </span>
        ))}
        {phrases.map((_, i) => (
          <Fragment key={`row${i}`}>
            <span key={`r${i}`} className={`jg-head jg-head--row${step.i === i ? " jg-head--active" : ""}`} role="rowheader">
              <b>#{i}</b><small>…{lastOf(i)}</small>
            </span>
            {phrases.map((__, j) => {
              const isSelf = i === j;
              const isCurrent = step.i === i && step.j === j;
              const isMatch = !isSelf && lastOf(i) === firstOf(j);
              const cls = ["jg-cell", isSelf ? "jg-cell--self" : "", isMatch ? "jg-cell--match" : "", isCurrent ? "jg-cell--current" : ""]
                .filter(Boolean).join(" ");
              return (
                <span key={`${i}-${j}`} role="cell" className={cls}
                  aria-label={isSelf ? `${i} with itself, not allowed` : `${i} then ${j}: ${isMatch ? "joins" : "no join"}`}>
                  {isSelf ? "" : isMatch ? "✓" : ""}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="jg-result" aria-label="Merged phrases so far">
        <span className="jg-title">result so far ({step.result.length})</span>
        {step.result.length === 0 && <span className="jg-empty">none yet</span>}
        <ul>
          {step.result.map((phrase) => (
            <li key={phrase} className={step.merged === phrase ? "jg-new" : ""}>{phrase}</li>
          ))}
        </ul>
      </div>
      <p className="jg-readout" role="status">
        {step.i !== null && step.j !== null
          ? `Pair #${step.i} then #${step.j}: "${lastOf(step.i)}" ${step.matched ? "matches" : "does not match"} "${firstOf(step.j)}".`
          : step.phase === "done" ? `Answer: ${step.result.length} phrase${step.result.length === 1 ? "" : "s"}.` : "Read the phrases."}
      </p>
    </div>
  );
}
