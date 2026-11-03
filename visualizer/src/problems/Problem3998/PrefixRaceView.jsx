import "./PrefixRaceView.css";

export default function PrefixRaceView({ run, step }) {
  if (!run || !step) return null;
  const { s, patterns } = run.input;
  const t = step.t;
  const n = s.length;
  const cells = (str, cls) => [...str].map((ch, i) => (
    <div key={i} className={`race__cell ${cls} ${i === step.i ? "race__cell--now" : ""}`}>
      <span className="race__idx">{i}</span>
      <span className="race__ch">{ch}</span>
    </div>
  ));
  return (
    <div className="race" role="img" aria-label={`Source ${s} and candidate for pattern ${step.pattern ?? "none"}`}>
      <div className="race__row"><span className="race__label">s</span>{cells(s, "race__cell--s")}</div>
      {t ? <div className="race__row"><span className="race__label">t</span>{cells(t, step.phase === "fail" ? "race__cell--bad" : "race__cell--t")}</div>
        : <p className="race__hint">Pick a pattern to build its candidate.</p>}
      {t && step.i >= 0 && (
        <div className="race__counts">
          <span>zeros in s up to here: <strong>{step.zs}</strong></span>
          <span>zeros in t up to here: <strong>{step.zt}</strong></span>
        </div>
      )}
      <div className="race__answers" aria-label="Answers so far">
        {patterns.map((p, idx) => {
          const known = idx < step.answers.length;
          const value = known ? step.answers[idx] : null;
          return (
            <span key={idx} className={`race__ans${known ? (value ? " race__ans--yes" : " race__ans--no") : ""}`}>
              {p}: {known ? (value ? "true" : "false") : "pending"}
            </span>
          );
        })}
      </div>
      <p className="race__msg">{step.message}</p>
    </div>
  );
}
