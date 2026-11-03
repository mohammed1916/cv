import "./StationGapView.css";

export default function StationGapView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="sg-view" aria-label="Maximum gap between stations">
        <p className="sg-empty">Press Play to place each worker as early as possible, then as late as possible.</p>
      </section>
    );
  }

  const { workers, stations } = run.input;
  const earliestAt = new Map();
  step.earliest.forEach((pos, w) => { if (pos !== undefined && pos >= 0) earliestAt.set(pos, w + 1); });
  const latestAt = new Map();
  step.latest.forEach((pos, w) => { if (pos >= 0) latestAt.set(pos, w + 1); });
  const pairActive = step.from !== null && step.to !== null;

  return (
    <section className="sg-view" aria-label="Maximum gap between stations">
      <div className="sg-row" role="img" aria-label={`Stations ${stations}`}>
        {[...stations].map((ch, p) => {
          const inGap = pairActive && p >= step.from && p <= step.to;
          const early = earliestAt.has(p);
          const late = latestAt.has(p);
          return (
            <div key={p} className={`sg-station${inGap ? " sg-station--gap" : ""}`}>
              <span className="sg-top">{early ? `E${earliestAt.get(p)}` : ""}</span>
              <span className="sg-letter">{ch}</span>
              <span className="sg-bottom">{late ? `L${latestAt.get(p)}` : ""}</span>
              <span className="sg-index">{p}</span>
            </div>
          );
        })}
      </div>
      <p className="sg-workers">Workers: {[...workers].map((ch, i) => `${i + 1}:${ch}`).join("  ")}</p>
      <dl className="sg-cards">
        <div><dt>Pair</dt><dd>{pairActive ? `${step.i + 1} and ${step.i + 2}` : "-"}</dd></div>
        <div><dt>Gap</dt><dd>{step.gap ?? "-"}</dd></div>
        <div><dt>Best</dt><dd>{step.best}</dd></div>
      </dl>
      <p className="sg-status">{step.message}</p>
    </section>
  );
}
