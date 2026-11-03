import "./PulseRotationView.css";

const signOf = (k) => (k % 2 === 0 ? "+" : "−");

function Row({ label, values, className }) {
  return (
    <div className="pr-row">
      <span className="pr-label">{label}</span>
      <ol className="pr-cells">
        {values.map((v, k) => (
          <li key={k} className={`pr-cell ${className ? className(k) : ""}`}>
            <span className="pr-sign" aria-hidden="true">{signOf(k)}</span>
            <span className="pr-value">{v}</span>
            <span className="pr-index">{k}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PulseRotationView({ run, step }) {
  if (!run || !step) {
    return <section className="pr-view"><p className="pr-empty">Press Play to test each left rotation as the right end moves.</p></section>;
  }
  const a = run.input;
  const lo = step.l >= 0 ? step.l : -1;
  const hi = step.r >= 0 ? step.r : -1;
  const bestL = step.bestL;
  const bestR = step.bestR;
  const segmentClass = (k) => {
    if (step.phase === "candidate" || step.phase === "extend" || step.phase === "record") {
      if (k === lo) return "pr-cell--from";
      if (k === hi) return "pr-cell--to";
    }
    return bestR !== null && k >= bestL && k <= bestR ? "pr-cell--best" : "";
  };
  return (
    <section className="pr-view" aria-label="Alternating sum with rotations">
      <Row label="array" values={a} className={segmentClass} />
      {step.preview && <Row label="best rotation" values={step.preview} className={() => "pr-cell--preview"} />}
      <dl className="pr-stats">
        <div><dt>unchanged pulse</dt><dd>{step.base}</dd></div>
        <div><dt>best gain so far</dt><dd>{step.bestGain}</dd></div>
        <div><dt>current gain</dt><dd>{step.gain === null || step.gain === undefined || !Number.isFinite(step.gain) ? "—" : step.gain}</dd></div>
      </dl>
      <p className="pr-legend">Segment for this step: start l = {lo >= 0 ? lo : "—"}, end r = {hi >= 0 ? hi : "—"}. Left end moves to the right end and the rest slide left.</p>
    </section>
  );
}
