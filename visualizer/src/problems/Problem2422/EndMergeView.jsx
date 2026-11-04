import "./EndMergeView.css";

// The array as tiles. The left group (from the start to i) and right group (from j to the end) are shaded;
// the untouched middle is pale. Group sums sit above each end.
export default function EndMergeView({ run, step }) {
  if (!run || !step) {
    return <section className="merge-view" aria-label="End groups"><p className="merge-empty">Press Play to merge from both ends.</p></section>;
  }
  const { nums } = step;
  const { i, j } = step;
  const done = step.phase === "done";
  return (
    <section className="merge-view" aria-label="End groups">
      <div className="merge-row" role="list">
        {nums.map((v, k) => {
          const inLeft = k <= i && !done;
          const inRight = k >= j && !done;
          const cls = ["merge-tile", inLeft ? "merge-tile--left" : "", inRight ? "merge-tile--right" : "", !inLeft && !inRight && !done ? "merge-tile--mid" : ""].join(" ");
          const pointer = !done ? [k === i ? "l" : "", k === j ? "r" : ""].filter(Boolean).join(" ") : "";
          return <span role="listitem" key={k} className={cls}><span className="merge-pointer" aria-label={pointer ? `pointer ${pointer}` : undefined} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", minHeight: 16 }}>{pointer}</span><span className="merge-value">{v}</span><span className="merge-index">{k}</span></span>;
        })}
      </div>
      <dl className="merge-state">
        <div><dt>Left group sum</dt><dd>{done ? "-" : step.left}</dd></div>
        <div><dt>Right group sum</dt><dd>{done ? "-" : step.right}</dd></div>
        <div><dt>Operations</dt><dd>{step.ops}</dd></div>
      </dl>
      <p className="merge-note">Left group: indices 0 to {i}. Right group: indices {j} to {nums.length - 1}. Shaded groups are the ones being compared.</p>
    </section>
  );
}
