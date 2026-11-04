import "./DifferenceTableView.css";

// Two rows of values show the current index. Below them, one bucket per difference
// (chosen nums1 sum minus chosen nums2 sum); the zero bucket is the balanced one.
export default function DifferenceTableView({ run, step }) {
  const { nums1, nums2 } = run.input;
  const table = step.table ?? [];
  const maxWays = Math.max(1, ...table.map(e => e.w));
  const r = step.index;

  return (
    <div className="dtv" aria-label="Difference table for the current index">
      <div className="dtv__pairs" style={{ gridTemplateColumns: `4.5rem repeat(${nums1.length}, minmax(2.5rem, 1fr))` }}>
        <div className="dtv__label">r (index)</div>
        {nums1.map((_, i) => (
          <div key={`i${i}`} className={`dtv__idx${i === r ? " is-current" : ""}`}>{i}</div>
        ))}
        <div className="dtv__label">nums1</div>
        {nums1.map((v, i) => (
          <div key={`a${i}`} className={`dtv__val dtv__val--a${i === r ? " is-current" : ""}`}>{v}</div>
        ))}
        <div className="dtv__label">nums2</div>
        {nums2.map((v, i) => (
          <div key={`b${i}`} className={`dtv__val dtv__val--b${i === r ? " is-current" : ""}`}>{v}</div>
        ))}
      </div>

      <div className="dtv__buckets" role="list" aria-label="Ways per difference">
        {table.length === 0 && <p className="dtv__empty">No ranges yet. The table is empty.</p>}
        {table.map(({ d, w }) => (
          <div role="listitem" key={d} className={`dtv__bucket${d === 0 ? " is-balanced" : ""}`}>
            <span className="dtv__d">{d > 0 ? `+${d}` : d}</span>
            <span className="dtv__bar" style={{ width: `${Math.max(6, (w / maxWays) * 100)}%` }} />
            <span className="dtv__w">{w} way{w === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>

      <p className="dtv__note">
        {step.phase === "count" ? `Balanced ways ending here: ${step.added}.` : step.phase === "done" ? "Totals are summed over every range." : "A range [l, r] that starts at l = r begins at the marked index. The bold row is difference 0, where the two sums are equal."}
      </p>
    </div>
  );
}
