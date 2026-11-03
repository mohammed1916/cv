import "./MedianWindowView.css";

// Shows the full array with the current window outlined, the window's values as bars
// against a target line at its median, and the sorted copy with the median marked.
export default function MedianWindowView({ run, step }) {
  const { nums, k } = run.input;
  const start = step.start ?? -1;
  const window = step.window || [];
  const sorted = step.sorted || [];
  const target = step.target;
  const maxValue = Math.max(9, ...nums);
  const hasWindow = start >= 0 && window.length > 0;

  return (
    <div className="median-window" aria-label="Median window view">
      <p className="median-window__caption">
        {hasWindow ? `Window ${start} to ${start + k - 1}` : "No window yet"}
        {target !== null && target !== undefined ? ` · target ${target}` : ""}
        {` · cost ${step.cost ?? 0}`}
        {step.best !== null && step.best !== undefined ? ` · best ${step.best}` : ""}
      </p>

      <div className="median-window__strip" role="list" aria-label="Full nums array">
        {nums.map((value, i) => {
          const inWindow = hasWindow && i >= start && i < start + k;
          const cls = `median-window__cell${inWindow ? " median-window__cell--in" : ""}`;
          return (
            <div className={cls} role="listitem" key={`n-${i}`}>
              <span className="median-window__value">{value}</span>
              <span className="median-window__index">{i}</span>
            </div>
          );
        })}
      </div>

      <div className="median-window__plot" aria-label="Window values against the target">
        {window.map((value, i) => {
          const height = Math.max(4, Math.round((value / maxValue) * 100));
          const isActive = i === step.index;
          return (
            <div className="median-window__col" key={`w-${i}`}>
              <div className={`median-window__bar${isActive ? " median-window__bar--active" : ""}`} style={{ height: `${height}%` }} />
              <span className="median-window__bar-value">{value}</span>
            </div>
          );
        })}
        {target !== null && target !== undefined && (
          <div className="median-window__target" style={{ bottom: `${Math.round((target / maxValue) * 100)}%` }}>
            <span>target {target}</span>
          </div>
        )}
      </div>

      <div className="median-window__row-label">Sorted copy (middle index {step.targetIndex >= 0 ? step.targetIndex : "-"})</div>
      <div className="median-window__row" role="list" aria-label="Sorted window">
        {sorted.map((value, i) => {
          const isMid = i === step.targetIndex;
          return (
            <div className={`median-window__cell${isMid ? " median-window__cell--mid" : ""}`} role="listitem" key={`s-${i}`}>
              <span className="median-window__value">{value}</span>
              <span className="median-window__index">{i}</span>
            </div>
          );
        })}
      </div>

      {step.index >= 0 && window[step.index] !== undefined && (
        <p className="median-window__deviation">
          Adding |{window[step.index]} - {target}| = {Math.abs(window[step.index] - target)} to the cost.
        </p>
      )}
    </div>
  );
}
