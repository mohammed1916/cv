import "./MinOperationsView.css";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";

// Search track for k, then one bar per value: grey is what the k shared operations remove, orange is what still needs chosen operations.
export default function MinOperationsView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="mo-view" aria-label="Minimum operations search">
        <p className="mo-empty">Press Play to search for the fewest operations.</p>
      </section>
    );
  }

  const { nums, x, y } = run.input;
  const top = Math.max(...nums, 1);
  const hi = step.hi ?? top;
  const lo = step.lo ?? 0;
  const mid = step.mid;
  const scale = (v) => `${Math.max(0, (v / top) * 100)}%`;
  const verdict = step.phase === "feasible" ? "mo-chip--ok" : step.phase === "infeasible" ? "mo-chip--bad" : "";

  return (
    <section className="mo-view" aria-label="Minimum operations search">
      <AnswerRangeBar title="Operations to test" min={0} max={Math.max(hi, 1)} low={lo} high={hi} probe={mid ?? null} verdict={step.phase === "feasible"} />
      <div className="mo-track" aria-label={`Search range from ${lo} to ${hi}`}>
        <div className="mo-track-bar">
          <span className="mo-marker mo-marker--lo" style={{ left: `${(lo / Math.max(hi, 1)) * 100}%` }}>lo {lo}</span>
          {mid !== null && mid !== undefined && (
            <span className="mo-marker mo-marker--mid" style={{ left: `${(mid / Math.max(hi, 1)) * 100}%` }}>mid {mid}</span>
          )}
          <span className="mo-marker mo-marker--hi" style={{ left: "100%" }}>hi {hi}</span>
        </div>
        <p className="mo-caption">Each operation is one chosen value losing x and every other value losing y. Testing k operations means k shared y losses plus the extra x-minus-y losses that picks add.</p>
      </div>

      <ul className="mo-rows" aria-label="Values at this probe">
        {nums.map((v, i) => {
          const row = step.rows?.[i];
          const computed = Boolean(row);
          const removed = mid !== null && mid !== undefined ? Math.min(v, mid * y) : 0;
          const left = row ? row.left : v - removed;
          return (
            <li key={i} className={`mo-row${computed ? "" : " mo-row--pending"}`}>
              <span className="mo-label">value {v}</span>
              <span className="mo-bar" aria-hidden="true">
                <span className="mo-bar-removed" style={{ width: scale(removed) }} />
                <span className="mo-bar-left" style={{ width: scale(Math.max(0, left)) }} />
              </span>
              <span className="mo-note">
                {mid === null || mid === undefined
                  ? "waiting for a probe"
                  : computed
                    ? left > 0
                      ? `left ${left}, needs ${row.need} pick${row.need === 1 ? "" : "s"}`
                      : "already nonpositive, needs 0"
                    : `left ${v - mid * y} before picks`}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mo-legend"><span className="mo-swatch mo-swatch--removed" /> removed by k times y <span className="mo-swatch mo-swatch--left" /> still positive, needs picks (x minus y = {x - y} per pick)</p>

      {(step.phase === "feasible" || step.phase === "infeasible") && (
        <output className={`mo-chip ${verdict}`} aria-label="Picks against mid">
          picks {step.picks} {step.phase === "feasible" ? "<=" : ">"} mid {mid}: {step.phase === "feasible" ? "enough" : "too few"}
        </output>
      )}
    </section>
  );
}
