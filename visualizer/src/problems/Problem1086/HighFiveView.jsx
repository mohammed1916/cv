import "./HighFiveView.css";

const SLOTS = 5;

// One lane per student: five slots hold the kept scores, the lowest sitting first.
// The record stream on top shows which score is being read, and the badge shows the decision.
export default function HighFiveView({ run, step }) {
  if (!run || !step) return null;
  const ids = [...new Set(run.input.map(([id]) => id))].sort((a, b) => a - b);
  const current = step.current;
  const decisionText = { fill: "fills an open slot", replace: "replaces the smallest", skip: "is skipped" };
  return (
    <div className="hf-view">
      <ol className="hf-stream" aria-label="Records in input order">
        {run.input.map(([id, score], index) => {
          const isCurrent = current && current.index === index;
          const isRead = current ? index < current.index : step.phase === "average" || step.phase === "done";
          return (
            <li key={index} className={`hf-record${isCurrent ? " hf-record--current" : ""}${isRead ? " hf-record--read" : ""}`}>
              <span className="hf-record__id">#{id}</span>
              <span className="hf-record__score">{score}</span>
            </li>
          );
        })}
      </ol>
      <div className="hf-lanes" role="list" aria-label="Kept top five scores per student">
        {ids.map((id) => {
          const kept = step.tops[id] || [];
          const isActive = current && current.id === id;
          const avg = step.averages && step.averages[id];
          const evicted = isActive && step.decision === "replace" ? step.evicted : null;
          return (
            <section key={id} role="listitem" className={`hf-lane${isActive ? " hf-lane--active" : ""}`}
              aria-label={`Student ${id}`}>
              <header className="hf-lane__head">
                <strong>Student {id}</strong>
                <span className="hf-lane__count">{kept.length} of {SLOTS} kept</span>
              </header>
              <div className="hf-slots">
                {Array.from({ length: SLOTS }, (_, slot) => {
                  const value = kept[slot];
                  const isNew = isActive && value === current.score && step.decision && step.decision !== "skip";
                  return (
                    <div key={slot} className={`hf-slot${value === undefined ? " hf-slot--empty" : ""}${isNew ? " hf-slot--new" : ""}${slot === 0 && value !== undefined ? " hf-slot--min" : ""}`}>
                      <span className="hf-slot__value">{value === undefined ? "open" : value}</span>
                      {slot === 0 && value !== undefined && <span className="hf-slot__tag">smallest</span>}
                    </div>
                  );
                })}
              </div>
              <div className="hf-lane__status">
                {isActive && step.decision ? (
                  <span className={`hf-badge hf-badge--${step.decision}`}>
                    score {current.score} {decisionText[step.decision]}
                    {evicted !== null ? ` (${evicted} out)` : ""}
                  </span>
                ) : isActive ? (
                  <span className="hf-badge hf-badge--read">reading score {current.score}</span>
                ) : null}
                {avg !== undefined && <span className="hf-avg">average {avg}</span>}
              </div>
            </section>
          );
        })}
      </div>
      <output aria-label="High five answer">{step.answer ? `answer ${step.answer.map(([id, avg]) => `[${id}, ${avg}]`).join(" ")}` : "answer pending"}</output>
    </div>
  );
}
