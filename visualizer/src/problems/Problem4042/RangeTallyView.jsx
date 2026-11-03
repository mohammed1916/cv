import "./RangeTallyView.css";

// The array is drawn as tiles. Tiles inside the current range [l, r] are shaded, the tile being
// counted is ringed, and the tally of each value is shown with a bar that must be even for a match.
export default function RangeTallyView({ run, step }) {
  if (!run || !step) return <p className="rt-empty">Press Play to walk through the queries.</p>;
  const { nums, k } = run.input;
  const tally = step.counts ? Object.entries(step.counts) : [];
  return (
    <section className="rt-view" aria-label="Range tally">
      <ol className="rt-tiles" aria-label={`Array with current range ${step.l} to ${step.r}`}>
        {nums.map((v, i) => {
          const inside = step.l !== undefined && i >= step.l && i <= step.r;
          const cls = ["rt-tile", inside ? "rt-tile--inside" : "", i === step.at ? "rt-tile--now" : ""].join(" ").trim();
          return (
            <li key={i} className={cls}>
              <span>{v}</span>
              <small>{i}</small>
            </li>
          );
        })}
      </ol>
      <p className="rt-caption">Range [{step.l}, {step.r}] needs {k} distinct value{k === 1 ? "" : "s"}, each count even.</p>
      <ul className="rt-tally" aria-label="Counts inside the range">
        {tally.length === 0 && <li className="rt-muted">No counts yet</li>}
        {tally.map(([value, count]) => (
          <li key={value} className={count % 2 ? "rt-odd" : "rt-even"}>
            <span>{`value ${value}`}</span>
            <span className="rt-count" style={{ width: `${Math.min(100, count * 22)}px` }} />
            <span>{count}{count % 2 ? " odd" : ""}</span>
          </li>
        ))}
      </ul>
      <p className="rt-readout">{step.valid === null || step.valid === undefined ? "Answer pending" : step.valid ? "Answer: true" : "Answer: false"}{step.g !== null && step.g !== undefined ? ` · g = ${step.g}` : ""}</p>
    </section>
  );
}
