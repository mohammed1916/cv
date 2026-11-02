import "./SubarrayWindowView.css";

// Top: the array as bars with the sliding window shaded. Bottom: the search interval [lo, hi] with the candidate mid.
export default function Problem1918View({ run, step }) {
  const nums = run.input.nums;
  const top = Math.max(...nums, 1);
  const hiBound = Math.max(nums.reduce((a, b) => a + b, 0), 1);
  const pct = v => `${Math.min(100, Math.max(0, (v / hiBound) * 100))}%`;
  const inWindow = k => step.left !== null && step.right !== null && k >= step.left && k <= step.right;
  return (
    <section className="sw-view" aria-label="Sliding window and binary search over the answer">
      <div className="sw-bars" role="img" aria-label="Array values as bars">
        {nums.map((v, k) => {
          const cls = ["sw-bar"];
          if (inWindow(k)) cls.push("sw-bar--window");
          if (step.right === k) cls.push("sw-bar--edge");
          return (
            <div key={k} className={cls.join(" ")}>
              <span style={{ height: `${Math.max(12, (v / top) * 100)}%` }}>{v}</span>
              <small>{k}</small>
            </div>
          );
        })}
      </div>
      <div className="sw-range" aria-label="Search interval">
        <div className="sw-range-fill" style={{ left: 0, width: pct(step.hi ?? 0) }} />
        {step.lo !== null && <div className="sw-range-mark" style={{ left: pct(step.lo) }} />}
        {step.hi !== null && <div className="sw-range-mark" style={{ left: pct(step.hi) }} />}
        {step.mid !== null && step.mid !== undefined && <div className="sw-range-mark" style={{ left: pct(step.mid), background: "#dc2626" }} />}
      </div>
      <div className="sw-facts">
        <span>lo <strong>{step.lo}</strong></span>
        <span>hi <strong>{step.hi}</strong></span>
        <span>mid <strong>{step.mid ?? "-"}</strong></span>
        <span>subarrays at most mid <strong>{step.total ?? "-"}</strong></span>
        <span>need k = <strong>{step.need}</strong></span>
      </div>
      <p className="sw-message">{step.message}</p>
    </section>
  );
}
