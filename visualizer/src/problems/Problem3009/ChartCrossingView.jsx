import "./ChartCrossingView.css";

const STEP_X = 64;
const PAD_X = 40;
const TOP = 28;
const BOTTOM = 220;

// Plot the chart: x is the point index, y is the height. The dashed line is the candidate horizontal line.
export default function ChartCrossingView({ run, step }) {
  if (!run || !step) {
    return <section className="cc-view" aria-label="Chart and horizontal line"><p className="cc-empty">Press Play to sweep candidate lines across the chart.</p></section>;
  }
  const y = run.input;
  const n = y.length;
  const lo = Math.min(...y) - 1;
  const hi = Math.max(...y) + 1;
  const width = PAD_X * 2 + (n - 1) * STEP_X;
  const X = i => PAD_X + i * STEP_X;
  const Y = v => BOTTOM - ((v - lo) / (hi - lo)) * (BOTTOM - TOP);
  const polyline = y.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const hasLine = step.h !== null && step.h !== undefined;

  return (
    <section className="cc-view" aria-label="Chart and horizontal line">
      <svg viewBox={`0 0 ${width} ${BOTTOM + 30}`} width="100%" role="img" aria-label={`Chart of ${n} points`}>
        <polyline className="cc-chart" points={polyline} />
        {hasLine ? <line className="cc-line" x1={PAD_X - 10} x2={width - PAD_X + 10} y1={Y(step.h)} y2={Y(step.h)} /> : null}
        {hasLine ? <text className="cc-line-label" x={width - PAD_X + 12} y={Y(step.h) + 4}>{`h = ${step.h}`}</text> : null}
        {y.map((v, i) => {
          const current = i === step.point;
          return (
            <g key={i}>
              <circle className={`cc-point${current ? " cc-point--current" : ""}`} cx={X(i)} cy={Y(v)} r={6} />
              <text className="cc-index" x={X(i)} y={BOTTOM + 22} textAnchor="middle">{`${i}:${v}`}</text>
            </g>
          );
        })}
        {step.segment >= 0 ? (
          <line className="cc-segment" x1={X(step.segment)} y1={Y(y[step.segment])} x2={X(step.segment + 1)} y2={Y(y[step.segment + 1])} />
        ) : null}
        {(step.crossings || []).map((c, k) => (
          <circle key={k} className={`cc-hit cc-hit--${c.kind}`} cx={X(c.x)} cy={Y(step.h)} r={7} />
        ))}
      </svg>
      <div className="cc-legend">
        <span><i className="cc-swatch cc-swatch--vertex" /> point on the line (counted once)</span>
        <span><i className="cc-swatch cc-swatch--cross" /> segment crossing inside its span</span>
      </div>
      <output aria-label="Intersection count" className="cc-count">
        {hasLine ? `Line at height ${step.h}: ${step.hits} intersection${step.hits === 1 ? "" : "s"}. ` : ""}
        {`Best so far: ${step.best}`}
      </output>
    </section>
  );
}
