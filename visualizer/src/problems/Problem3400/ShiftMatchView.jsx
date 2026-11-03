import "./ShiftMatchView.css";

// Two rows: nums2 stays fixed, nums1 slides right by the current shift.
// Each column compares the value above (nums1 at src) with the value below (nums2 at i).
export default function ShiftMatchView({ run, step }) {
  const { nums1, nums2 } = run.input;
  const n = nums1.length;
  const shift = step.shift;
  const active = step.index;
  const hasShift = shift >= 0;
  const counts = step.counts || [];

  return (
    <div className="shift-match" aria-label="Right shift matching view">
      <p className="shift-match__caption">
        {hasShift ? `Shift ${shift}` : "Before the first shift"} · count {step.count} · best {step.best}
        {step.bestShift >= 0 && step.best > 0 ? ` (shift ${step.bestShift})` : ""}
      </p>

      <div className="shift-match__row-label">nums1 after shift</div>
      <div className="shift-match__row" role="list" aria-label="Shifted nums1">
        {step.shifted.map((value, i) => {
          const cls = i === active ? "shift-match__cell shift-match__cell--source" : "shift-match__cell";
          return (
            <div className={cls} role="listitem" key={`top-${i}`}>
              <span className="shift-match__value">{value}</span>
              <span className="shift-match__index">{i}</span>
            </div>
          );
        })}
      </div>

      <div className="shift-match__cols" aria-hidden="true">
        {nums2.map((_, i) => {
          let tag = "";
          if (i === active && step.match === true) tag = "match";
          else if (i === active && step.match === false) tag = "miss";
          else if (i === active) tag = "current";
          return <span key={`c-${i}`} className={`shift-match__tick shift-match__tick--${tag || "idle"}`}>{i === active ? (step.match === true ? "=" : step.match === false ? "x" : "^") : ""}</span>;
        })}
      </div>

      <div className="shift-match__row" role="list" aria-label="Fixed nums2">
        {nums2.map((value, i) => {
          const cls = i === active
            ? `shift-match__cell shift-match__cell--${step.match === true ? "hit" : step.match === false ? "miss" : "target"}`
            : "shift-match__cell";
          return (
            <div className={cls} role="listitem" key={`bot-${i}`}>
              <span className="shift-match__value">{value}</span>
              <span className="shift-match__index">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="shift-match__row-label">nums2 (fixed)</div>

      <div className="shift-match__bars" aria-label="Match count per shift">
        {counts.map((count, k) => {
          const height = count === null ? 0 : Math.round((count / n) * 100);
          const isBest = count !== null && k === step.bestShift && step.best > 0;
          return (
            <div className="shift-match__bar-wrap" key={`b-${k}`}>
              <div className={`shift-match__bar${isBest ? " shift-match__bar--best" : ""}${k === shift ? " shift-match__bar--current" : ""}`}
                style={{ height: `${height}%` }} title={count === null ? "not counted yet" : `${count} matches`} />
              <span className="shift-match__bar-label">{count === null ? "-" : count}</span>
              <span className="shift-match__bar-shift">k{k}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
