import "./MirrorHalfView.css";

// The first half is editable digits; the mirror half is shown dimmed and follows automatically.
export default function Problem1842View({ run, step }) {
  const half = step.half || [];
  const mirror = [...half].reverse();
  const result = step.phase === "done" && run.result !== "" ? run.result : null;
  const cls = (k) => {
    if (step.i === k && step.j === null) return "mir-digit mir-digit--pivot";
    if (step.i === k || step.j === k) return "mir-digit mir-digit--swap";
    return "mir-digit";
  };
  return (
    <section className="mir-view" aria-label="Palindrome from its first half">
      <div className="mir-row">
        <span className="mir-label">first half</span>
        {half.length === 0 && <span className="mir-message">(empty)</span>}
        {half.map((d, k) => (
          <div key={k} className={cls(k)}>
            {d}
            <small>{k}</small>
          </div>
        ))}
        {step.middle && <div className="mir-digit mir-digit--middle">{step.middle}</div>}
      </div>
      <div className="mir-row">
        <span className="mir-label">mirror</span>
        {mirror.map((d, k) => <div key={k} className="mir-digit mir-digit--mirror">{d}</div>)}
      </div>
      <div className="mir-row">
        <span className="mir-label">result</span>
        <span className="mir-message">{result === null ? (step.phase === "done" && run.result === "" ? "empty string: no larger palindrome" : "pending") : result}</span>
      </div>
      <p className="mir-message">{step.message}</p>
    </section>
  );
}
