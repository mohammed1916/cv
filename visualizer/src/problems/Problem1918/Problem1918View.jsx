import "./SubarrayWindowView.css";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";

// Top: the array as bars with the window pointers l and r labelled. Bottom: the answer search interval [lo, hi] with the candidate mid.
export default function Problem1918View({ run, step }) {
  const nums = run.input.nums;
  const top = Math.max(...nums, 1);
  const hiBound = Math.max(nums.reduce((a, b) => a + b, 0), 1);
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
              <em className="sw-pointer">{step.left === k ? "l" : step.right === k ? "r" : " "}</em>
              <span style={{ height: `${Math.max(12, (v / top) * 100)}%` }}>{v}</span>
              <small>{k}</small>
            </div>
          );
        })}
      </div>
      {step.lo !== null && step.hi !== null && <AnswerRangeBar
        title="Answer search over subarray sums"
        min={0}
        max={hiBound}
        low={step.lo}
        high={step.hi}
        probe={step.mid ?? null}
        verdict={step.mid !== null && step.mid !== undefined ? step.total >= step.need : null}
      />}
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
