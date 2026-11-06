import "./SwitcherView.css";

export default function SwitcherView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="sw-view" aria-label="Window switcher">
        <p>Press Play to activate windows one at a time.</p>
      </section>
    );
  }

  const { order, activations } = step;
  return (
    <section className="sw-view" aria-label="Window switcher">
      <div>
        <p className="sw-label">Activation sequence, indexed by time (current activation highlighted)</p>
        <div className="sw-seq" role="list" aria-label="Activations">
          {activations.map((w, t) => {
            const cls = t === step.time ? "sw-seq--now" : t < step.time ? "sw-seq--past" : "";
            return <span key={t} role="listitem" className={cls}><small>[{t}]</small> {w}</span>;
          })}
        </div>
      </div>
      <div>
        <p className="sw-label">Most recent (left) to least recent (right)</p>
        <div className="sw-row" role="list" aria-label="Window order">
          {order.map((id, pos) => {
            const cls = [
              "sw-card",
              pos === 0 && step.phase !== "start" ? "sw-card--front" : "",
              step.phase === "find" && id === step.window ? "sw-card--from" : "",
            ].join(" ").trim();
            return (
              <div key={id} role="listitem" className={cls} aria-label={`window ${id} at position ${pos}`}>
                <span className="sw-card__id">{id}</span>
                <span className="sw-card__pos">position {pos}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="sw-message" aria-live="polite">{step.message}</p>
    </section>
  );
}
