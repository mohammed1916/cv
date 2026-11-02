import "./OnceGateView.css";

// A gate that starts open and closes after the first call; each call row shows whether fn ran or returned undefined.
export default function OnceGateView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="og-view" aria-label="Once gate">
        <p className="og-empty">Press Play to see the gate open once and then stay closed.</p>
      </section>
    );
  }
  const open = !step.called;
  return (
    <section className="og-view" aria-label="Once gate">
      <div className={`og-gate ${open ? "og-gate--open" : "og-gate--closed"}`} aria-label={open ? "Gate open: fn can run" : "Gate closed: fn has run"}>
        <span className="og-icon" aria-hidden="true">{open ? "🔓" : "🔒"}</span>
        <span className="og-gate-text">
          <strong>{open ? "Open" : "Closed"}</strong>
          <small>{open ? "called is false, so the next call can run fn" : "called is true, so every later call returns undefined"}</small>
        </span>
      </div>
      <ol className="og-calls" aria-label="Calls so far">
        {run.input.calls.map((args, i) => {
          const done = step.results[i];
          const current = step.call === i;
          return (
            <li key={i} className={`og-call${current ? " og-call--current" : ""}${done ? "" : " og-call--pending"}`}>
              <span className="og-args">call {i + 1}: [{args.join(", ")}]</span>
              <span className={`og-result ${done ? (done.returned ? "og-result--ran" : "og-result--skipped") : ""}`}>
                {!done ? "not yet" : done.returned ? `fn ran, returned ${done.value}` : "returned undefined"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
