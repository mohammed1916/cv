import "./ElementsAfterRemovalView.css";

// Top: the cycle as one tick per second (grey = removing, blue = restoring).
// Middle: the original slots, solid when the element is present now.
// Bottom: the current array, with the queried index marked.
export default function ElementsAfterRemovalView({ run, step }) {
  const nums = run.input.nums;
  const cycle = step.cycle ?? 2 * nums.length;
  const n = nums.length;
  const presentSlots = new Set((step.present ?? []).map(cell => cell.i));
  const isQuery = step.queryIndex >= 0;
  const caption = step.phase === "done" ? "All queries answered" : isQuery ? `Query [${step.queryTime}, ${step.queryIndex}] at second ${step.time}` : `Second ${step.time} of ${cycle}`;

  return (
    <div className="ear-view" aria-label="Array after removals and restores">
      <p className="ear-view__caption">{caption}</p>

      <div className="ear-view__cycle" aria-label="Cycle of seconds">
        {Array.from({ length: cycle }, (_, p) => {
          const kind = p < n ? "remove" : "restore";
          const now = p === step.time;
          return (
            <span key={p} className={`ear-view__tick ear-view__tick--${kind}${now ? " is-now" : ""}`}>
              {p}
            </span>
          );
        })}
      </div>

      <div className="ear-view__row-label">Original nums (slot = original index)</div>
      <div className="ear-view__row">
        {nums.map((value, i) => {
          const here = presentSlots.has(i);
          return (
            <div key={i} className={`ear-view__cell${here ? " is-present" : " is-gone"}`}>
              <strong>{value}</strong>
              <small>slot {i}</small>
              <span className="ear-view__badge">{here ? "in array" : "out"}</span>
            </div>
          );
        })}
      </div>

      <div className="ear-view__row-label">Current array</div>
      <div className="ear-view__row ear-view__row--array">
        {(step.present ?? []).length === 0 && <div className="ear-view__empty">empty array</div>}
        {(step.present ?? []).map((cell, pos) => {
          const queried = isQuery && pos === step.queryIndex;
          return (
            <div key={cell.i} className={`ear-view__cell ear-view__cell--array${queried ? " is-queried" : ""}`}>
              <strong>{cell.v}</strong>
              <small>index {pos}</small>
              {queried && <span className="ear-view__badge ear-view__badge--answer">asked</span>}
            </div>
          );
        })}
        {isQuery && step.queryIndex >= (step.present ?? []).length && (
          <div className="ear-view__cell ear-view__cell--missing">
            <strong>-1</strong>
            <small>index {step.queryIndex} is past the end</small>
          </div>
        )}
      </div>
    </div>
  );
}
