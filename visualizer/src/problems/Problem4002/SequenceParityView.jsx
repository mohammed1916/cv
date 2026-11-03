import "./SequenceParityView.css";

export default function SequenceParityView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="sp-view" aria-label="Valid sequence count">
        <p className="sp-empty">Press Play to count the cuts, then remove the all-odd sequences.</p>
      </section>
    );
  }

  const { n, k } = run.input;
  const parityText = step.parity === null ? "checking" : step.parity ? "n - k is even" : "n - k is odd";

  return (
    <section className="sp-view" aria-label="Valid sequence count">
      <div className="sp-strip" role="img" aria-label={`${n} unit cells split into ${k} positive parts`}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`sp-unit${step.parity === false ? " sp-unit--mixed" : ""}`} />
        ))}
      </div>
      <p className="sp-caption">{n} unit cells, split into {k} positive parts (each part is one sequence entry)</p>
      <dl className="sp-cards">
        <div><dt>All cuts</dt><dd>{step.total ?? "-"}</dd></div>
        <div><dt>Parity</dt><dd>{parityText}</dd></div>
        <div><dt>All odd</dt><dd>{step.odd ?? "-"}</dd></div>
        <div><dt>Even product</dt><dd>{step.answer ?? "-"}</dd></div>
      </dl>
      <p className="sp-status">{step.message}</p>
    </section>
  );
}
