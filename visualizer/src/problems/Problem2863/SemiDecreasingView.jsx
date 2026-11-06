import "./SemiDecreasingView.css";
import PointerRail from '../../components/shared/PointerRail';

// Bars show each value's height. The left end, the right end being tested, and the best span
// found so far are drawn as brackets under the bars, so the scan and its result read together.
export default function SemiDecreasingView({ run, step }) {
  if (!run || !step) {
    return <section className="sd-view" aria-label="Semi-decreasing subarrays"><p className="sd-empty">Press Play to scan each left end against the right ends.</p></section>;
  }
  const { nums } = run;
  const max = Math.max(1, ...nums);
  const { l, r, compare, bestSpan } = step;
  const inSpan = (i, span) => span && i >= span[0] && i <= span[1];
  const inCandidate = i => l !== null && r !== null && i >= l && i <= r;

  return (
    <section className="sd-view" aria-label="Array bars with the scanned subarray">
      <div className="sd-bars" role="img" aria-label="Values as bars">
        {nums.map((value, i) => {
          const cls = ["sd-col", i === l ? "sd-col--left" : "", i === r ? "sd-col--right" : "",
            inSpan(i, bestSpan) ? "sd-col--best" : ""].join(" ");
          return (
            <div key={i} className={cls}>
              <span className="sd-value">{value}</span>
              <div className="sd-bar" style={{ height: `${(value / max) * 110 + 8}px` }} />
              <span className="sd-index">{i}</span>
            </div>
          );
        })}
      </div>
      <PointerRail
        title="Pointers on the values"
        values={nums}
        pointers={[
          ...(l !== null && l !== undefined ? [{ id: 'l', label: 'l', index: l, tone: 'primary' }] : []),
          ...(r !== null && r !== undefined ? [{ id: 'r', label: 'r', index: r, tone: 'warning' }] : []),
        ]}
      />
      <div className="sd-brackets" aria-label="Current candidate and best span">
        <div className="sd-track">
          {nums.map((_, i) => (
            <span key={i} className={`sd-cell ${inCandidate(i) ? "sd-cell--candidate" : ""} ${inSpan(i, bestSpan) ? "sd-cell--best" : ""}`}>
              {i === l ? "L" : i === r ? "R" : ""}
            </span>
          ))}
        </div>
        <p className="sd-legend">
          <span className="sd-key sd-key--candidate" /> candidate subarray
          <span className="sd-key sd-key--best" /> best so far
        </p>
      </div>
      <p className="sd-status">
        {l !== null && r !== null && compare !== null && (
          <>Compare nums[{l}] = {nums[l]} with nums[{r}] = {nums[r]}: <b>{compare ? "greater, valid" : "not greater"}</b>. </>
        )}
        Best length: <b>{step.best}</b>
        {bestSpan && <> (span {bestSpan[0]}..{bestSpan[1]})</>}
      </p>
    </section>
  );
}
