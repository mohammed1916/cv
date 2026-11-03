import "./PileDealView.css";

export default function PileDealView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pd-view" aria-label="Pile dealing">
        <p className="pd-empty">Press Play to deal each value onto a pile.</p>
      </section>
    );
  }

  const { nums, piles } = step;
  return (
    <section className="pd-view" aria-label="Pile dealing">
      <div className="pd-input" aria-label="Values in order">
        {nums.map((v, idx) => {
          const cls = idx === step.index ? "pd-now" : idx < step.index ? "pd-done" : "";
          return <span key={idx} className={cls}>{v}</span>;
        })}
      </div>
      <div className="pd-piles" role="list" aria-label="Piles, ordered by top">
        {piles.length === 0 && <p className="pd-empty">No piles yet.</p>}
        {piles.map((pile, p) => {
          const cls = [
            "pd-pile",
            step.target === p ? "pd-pile--target" : "",
            step.phase === "new" && p === step.target ? "pd-pile--new" : "",
          ].join(" ").trim();
          return (
            <div key={p} role="listitem" className={cls} aria-label={`Pile ${p + 1}, top ${pile[pile.length - 1]}`}>
              <span className="pd-pile__label">pile {p + 1}</span>
              {pile.map((v, idx) => {
                const top = idx === pile.length - 1;
                const fresh = top && step.target === p && step.phase !== "done" && (step.phase === "place" || step.phase === "new");
                const valueCls = ["pd-value", top ? "pd-value--top" : "", fresh ? "pd-value--new" : ""].join(" ").trim();
                return <div key={idx} className={valueCls}>{v}</div>;
              })}
            </div>
          );
        })}
      </div>
      <p className="pd-message" aria-live="polite">{step.message}</p>
      <output aria-label="Piles so far">Piles so far: {piles.length}{step.k >= 0 && step.x !== null ? `, tops below ${step.x}: ${step.k}` : ""}</output>
    </section>
  );
}
