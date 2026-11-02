import "./PointerTracksView.css";

// One track per row. Values before a row's pointer are ruled out (dimmed); the pointer value is boxed.
// The high value is drawn as a dashed line across all tracks. Rows that advance this step are flagged.
export default function PointerTracksView({ run, step }) {
  if (!run || !step) return null;
  const mat = run.input;
  const ended = step.phase === "done" && step.answer === -1;
  return (
    <div className="pt-view">
      <div className="pt-tracks" role="table" aria-label="Rows with pointers">
        {mat.map((row, r) => {
          const pointer = step.pointers[r];
          const atEnd = pointer >= row.length;
          const isAdvancing = step.advanced && step.advanced.includes(r);
          const headValue = step.values ? step.values[r] : null;
          return (
            <div key={r} role="row" className={`pt-track${isAdvancing ? " pt-track--advancing" : ""}`}>
              <span role="rowheader" className="pt-track__name">row {r + 1}</span>
              <div className="pt-track__cells">
                {row.map((value, j) => {
                  const isPointer = j === pointer;
                  const isRuledOut = j < pointer;
                  const isHighCell = step.high !== null && isPointer && headValue === step.high && step.low !== step.high;
                  const isCommon = step.phase === "done" && step.answer !== null && step.answer >= 0 && value === step.answer;
                  const classes = ["pt-cell", isRuledOut ? "pt-cell--out" : "", isPointer ? "pt-cell--pointer" : "",
                    isHighCell ? "pt-cell--high" : "", isCommon ? "pt-cell--common" : ""].filter(Boolean).join(" ");
                  return (
                    <span key={j} role="cell" className={classes}>
                      {value}
                      {isPointer && <small className="pt-cell__tag">{isHighCell ? "high" : "ptr"}</small>}
                    </span>
                  );
                })}
                {atEnd && <span className="pt-cell pt-cell--end" role="cell">row ended</span>}
              </div>
              <span className="pt-track__state">
                {isAdvancing ? "advances" : headValue !== null && headValue !== undefined ? `head ${headValue}` : ""}
              </span>
            </div>
          );
        })}
      </div>
      <p className="pt-readout" role="status">
        {step.high !== null && step.high !== undefined && step.low !== step.high
          ? `Low ${step.low} and high ${step.high}: rows below ${step.high} move on.`
          : step.phase === "done" && step.answer >= 0 ? `Every row shows ${step.answer}.`
          : ended ? "A pointer ran past its row, so there is no common value."
          : "Set every pointer to its first value."}
      </p>
      <output aria-label="Smallest common element">answer {step.phase === "done" ? step.answer : "pending"}</output>
    </div>
  );
}
