import "./PathParityView.css";

// Top: the path being built, one slot per position, with the last value highlighted.
// Middle: the value pool 1..n, marked used or free, with each value's parity labelled.
// Bottom: the finished permutations found so far, in the order they were recorded.
export default function PathParityView({ run, step }) {
  const { n } = run.input;
  const path = step.path || [];
  const used = step.used || [];
  const results = step.results || [];
  const value = step.value;
  const values = Array.from({ length: n }, (_, i) => i + 1);

  return (
    <div className="path-parity" aria-label="Alternating parity permutation view">
      <p className="path-parity__caption">
        {`Path length ${path.length} of ${n}`}
        {value != null ? ` · candidate ${value} (${value % 2 === 0 ? "even" : "odd"})` : ""}
      </p>

      <div className="path-parity__label">Path being built</div>
      <div className="path-parity__slots" role="list" aria-label="Path slots">
        {values.map((_, position) => {
          const filled = position < path.length;
          const isLast = position === path.length - 1;
          const cls = `path-parity__slot${filled ? " path-parity__slot--filled" : ""}${isLast && step.phase !== "undo" ? " path-parity__slot--last" : ""}`;
          return (
            <div className={cls} role="listitem" key={`s-${position}`}>
              <span className="path-parity__value">{filled ? path[position] : ""}</span>
              <span className="path-parity__index">{position}</span>
            </div>
          );
        })}
      </div>

      <div className="path-parity__label">Values 1 to {n} (used or free)</div>
      <div className="path-parity__pool" role="list" aria-label="Value pool">
        {values.map(v => {
          const isUsed = used[v];
          const isCandidate = v === value;
          const tone = step.phase === "reject" && isCandidate ? " path-parity__chip--reject" : "";
          return (
            <div className={`path-parity__chip${isUsed ? " path-parity__chip--used" : ""}${isCandidate ? " path-parity__chip--candidate" : ""}${tone}`}
              role="listitem" key={`v-${v}`}>
              <span className="path-parity__value">{v}</span>
              <span className="path-parity__parity">{v % 2 === 0 ? "even" : "odd"}</span>
              <span className="path-parity__state">{isUsed ? "used" : "free"}</span>
            </div>
          );
        })}
      </div>

      <div className="path-parity__label">Found permutations ({results.length})</div>
      <ol className="path-parity__results" aria-label="Found permutations">
        {results.length === 0 && <li className="path-parity__empty">None yet</li>}
        {results.map((row, r) => (
          <li key={`r-${r}`} className={r === results.length - 1 && step.phase === "record" ? "path-parity__result path-parity__result--new" : "path-parity__result"}>
            [{row.join(", ")}]
          </li>
        ))}
      </ol>
    </div>
  );
}
