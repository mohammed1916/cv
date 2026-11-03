import "./HullLinesView.css";

const W = 360;
const H = 220;
const PAD = 30;
const XMAX = 100;

export default function HullLinesView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="hl-view" aria-label="Hull of hop lines">
        <p className="hl-empty">Press Play to watch the hull of hop lines grow.</p>
      </section>
    );
  }

  const lines = step.lines;
  const yVals = lines.flatMap(l => [l.b, l.m * XMAX + l.b, l.b * 1]);
  const yMin = Math.min(0, ...yVals);
  const yMax = Math.max(1, ...yVals);
  const sx = x => PAD + (x / XMAX) * (W - PAD * 2);
  const sy = y => H - PAD - ((y - yMin) / Math.max(1, yMax - yMin)) * (H - PAD * 2);
  const hullSet = new Set(step.hull);
  const hullLines = lines.filter(l => hullSet.has(l.i));
  const lineSeg = l => `M ${sx(0)} ${sy(l.b)} L ${sx(XMAX)} ${sy(l.m * XMAX + l.b)}`;
  const hullOrder = step.hull.map(idx => lines.find(l => l.i === idx)).filter(Boolean);
  const range = step.lo >= 0 ? new Set(step.hull.slice(step.lo, step.hi + 1)) : new Set();

  return (
    <section className="hl-view" aria-label="Hull of hop lines">
      <svg className="hl-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lines for each earlier index, with the hull">
        <line className="hl-axis" x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} />
        <line className="hl-axis" x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} />
        <text className="hl-text" x={PAD} y={H - 10}>x = 0</text>
        <text className="hl-text" x={W - PAD - 40} y={H - 10}>x = {XMAX}</text>
        {lines.filter(l => !hullSet.has(l.i)).map(l => (
          <path key={`all-${l.i}`} d={lineSeg(l)} stroke="var(--hl-faint)" strokeWidth="1" fill="none" />
        ))}
        {hullLines.map(l => (
          <path key={`hull-${l.i}`} d={lineSeg(l)} stroke={l.i === step.chosen ? "var(--hl-chosen)" : "var(--hl-hull)"}
            strokeWidth={l.i === step.chosen ? 3 : 2} fill="none" />
        ))}
        {step.x !== null && step.x !== undefined && (
          <line x1={sx(step.x)} y1={PAD} x2={sx(step.x)} y2={H - PAD} stroke="var(--hl-query)" strokeDasharray="5 4" strokeWidth="2" />
        )}
        {step.popped >= 0 && lines.filter(l => l.i === step.popped).map(l => (
          <path key="popped" d={lineSeg(l)} stroke="var(--hl-pop)" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        ))}
      </svg>
      <ol className="hl-hull-list" aria-label="Hull lines from right to left">
        {hullOrder.map((l, pos) => {
          const cls = [
            l.i === step.chosen ? "hl-now" : "",
            range.has(l.i) ? "hl-range" : "",
          ].join(" ").trim();
          return (
            <li key={l.i} className={cls}>
              hull {pos}: index {l.i}
              {step.lo >= 0 && pos === step.mid ? " (mid)" : ""}
            </li>
          );
        })}
      </ol>
      <p className="hl-message" aria-live="polite">{step.message}</p>
      <output aria-label="Current landing value">
        {step.x !== null && step.x !== undefined ? `Query x = ${step.x}; best so far at ${step.j}: ${step.best[step.j] ?? "-"}` : `best[${step.j}] = ${step.best[step.j] ?? "-"}`}
      </output>
    </section>
  );
}
