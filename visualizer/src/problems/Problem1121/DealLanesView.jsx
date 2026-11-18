import IndexedSequence from "../../components/shared/IndexedSequence";
import FrequencyCountTable from "../../components/shared/FrequencyCountTable";
import "./DealLanesView.css";

// Top: the array as cards, with the frequency bars that set f.
// Bottom: f sequence lanes; each element is dealt into lane i mod f, so the cards in a lane keep index order.
export default function DealLanesView({ run, step }) {
  if (!run || !step) return null;
  const { nums, k } = run.input;
  const counts = step.counts || null;
  const lanes = step.lanes || [];
  const dealtLane = step.lane;
  return (
    <div className="dl-view">
      <IndexedSequence
        label="Sorted input"
        length={nums.length}
        valueAt={(index) => String(nums[index])}
        active={step.dealt >= 0 ? step.dealt : -1}
        roleAt={(index) => (step.dealt > index ? "dealt" : "")}
      />

      {counts && (
        <FrequencyCountTable
          title={`Largest group f = ${step.f}`}
          entries={Object.entries(counts)}
          active={Object.keys(counts).find((value) => counts[value] === step.f) ?? null}
        />
      )}

      {step.phase === "check" || step.phase === "count" || step.phase === "setup" ? (
        <p className="dl-equation" role="status">
          n = {run.input.nums.length} and k × f = {k} × {step.f ?? "?"} = {step.f ? k * step.f : "?"}
          {step.verdict === false ? " : too few values" : step.f && run.input.nums.length >= k * step.f ? " : enough room" : ""}
        </p>
      ) : null}

      {lanes.length > 0 && (
        <section className="dl-section" aria-label="Sequences">
          <h3 className="dl-title">{lanes.length} sequence{lanes.length === 1 ? "" : "s"} (lane = index mod {lanes.length})</h3>
          <div className="dl-lanes">
            {lanes.map((items, laneIndex) => {
              const isVerified = step.phase === "verify" && step.lane === laneIndex;
              const verified = step.phase === "verify" && step.lane !== null && laneIndex <= step.lane;
              return (
                <div key={laneIndex} className={`dl-lane${dealtLane === laneIndex ? " dl-lane--receiving" : ""}${isVerified ? " dl-lane--checking" : ""}`}>
                  <span className="dl-lane__name">seq {laneIndex + 1}</span>
                  <span className="dl-lane__items">
                    {items.length === 0 && <span className="dl-lane__empty">empty</span>}
                    {items.map((value, j) => (
                      <span key={j} className="dl-item">{value}</span>
                    ))}
                  </span>
                  <span className="dl-lane__size">{items.length}/{k}</span>
                  {verified && <span className={`dl-lane__verdict${step.verdict === false && step.lane === laneIndex ? " dl-lane__verdict--bad" : ""}`}>
                    {step.verdict === false && step.lane === laneIndex ? "fails" : "ok"}
                  </span>}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <output aria-label="Divide answer">{step.phase === "done" ? `answer ${step.verdict ? "true" : "false"}` : "answer pending"}</output>
    </div>
  );
}
