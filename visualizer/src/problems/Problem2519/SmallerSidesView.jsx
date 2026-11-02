import "./SmallerSidesView.css";

// Each index as a column: its value, the smaller values to its left and right, and whether it is k-big.
export default function SmallerSidesView({ run, step }) {
  if (!run || !step) {
    return <section className="big-view" aria-label="Smaller values on each side"><p className="big-empty">Press Play to count the smaller values on each side.</p></section>;
  }
  const { nums, k } = run.input;
  const n = nums.length;
  return (
    <section className="big-view" aria-label="Smaller values on each side">
      <p className="big-k">k = {k}. An index is k-big when both sides hold at least {k} strictly smaller values.</p>
      <div className="big-grid" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(44px, 1fr))` }}>
        <span className="big-label">index</span>
        {nums.map((_, i) => <span key={`i${i}`} className={`big-head${i === step.i ? " big-head--active" : ""}`}>{i}</span>)}
        <span className="big-label">value</span>
        {nums.map((v, i) => <span key={`v${i}`} className={`big-cell${i === step.i ? " big-cell--active" : ""}`}>{v}</span>)}
        <span className="big-label">smaller before</span>
        {nums.map((_, i) => <span key={`b${i}`} className="big-cell">{i < step.before.length ? step.before[i] : "?"}</span>)}
        <span className="big-label">smaller after</span>
        {nums.map((_, i) => <span key={`a${i}`} className="big-cell">{i < step.after.length ? step.after[i] : "?"}</span>)}
        <span className="big-label">k-big</span>
        {nums.map((_, i) => {
          const known = i < step.before.length && i < step.after.length;
          const big = known && step.before[i] >= k && step.after[i] >= k;
          const cls = !known ? "big-cell" : big ? "big-cell big-cell--big" : "big-cell big-cell--no";
          return <span key={`k${i}`} className={cls}>{!known ? "?" : big ? "yes" : "no"}</span>;
        })}
      </div>
      <p className="big-total">Count so far: {step.count}</p>
    </section>
  );
}
