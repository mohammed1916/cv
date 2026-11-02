import "./ConfusingLanesView.css";

const TABLE = [["0", "0"], ["1", "1"], ["6", "9"], ["8", "8"], ["9", "6"]];

// Candidates are grouped into one lane per digit count. Each chip is a visited number with its rotation.
// Green chips are confusing (the rotation differs), grey chips rotate to themselves.
export default function ConfusingLanesView({ run, step }) {
  if (!run || !step) return null;
  const visited = run.nodes.slice(0, step.visitedCount);
  const current = step.phase === "check" && visited.length ? visited[visited.length - 1] : null;
  const maxDigits = String(run.input).length;
  const lanes = Array.from({ length: maxDigits }, (_, index) => index + 1);
  return (
    <div className="cn-view">
      <div className="cn-table" aria-label="Digit rotation table">
        {TABLE.map(([digit, turned]) => (
          <span key={digit} className="cn-table__cell">
            <b>{digit}</b> <span aria-hidden="true">↻</span> <b>{turned}</b>
          </span>
        ))}
      </div>
      <div className="cn-lanes">
        {lanes.map((length) => {
          const chips = visited.filter((node) => String(node.value).length === length);
          return (
            <section key={length} className="cn-lane" aria-label={`${length}-digit candidates`}>
              <header className="cn-lane__head">
                <strong>{length}-digit</strong>
                <span>{chips.filter((node) => node.confusing).length} confusing of {chips.length} visited</span>
              </header>
              <div className="cn-chips">
                {chips.map((node) => (
                  <span key={node.value} className={`cn-chip${node.confusing ? " cn-chip--yes" : " cn-chip--same"}${current && current.value === node.value ? " cn-chip--current" : ""}`}
                    title={`${node.value} rotates to ${node.rot}`}>
                    {node.value}
                    {node.confusing && <small>→{node.rot}</small>}
                  </span>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="cn-readout" role="status">
        {current ? (
          <span className="cn-readout__now">{current.value} rotates to {current.rot}: {current.confusing ? "counts" : "does not count"}</span>
        ) : step.phase === "prune" ? (
          <span className="cn-readout__now cn-readout__now--prune">{step.x} is above {run.input}, so the branch stops</span>
        ) : (
          <span className="cn-readout__now">Count so far: {step.count}</span>
        )}
        <output aria-label="Confusing count">count {step.count}</output>
      </div>
    </div>
  );
}
