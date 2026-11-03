import "./BitDoublingView.css";

// The binary digits of n are shown as cells. The digit being read is ringed, and the pair
// (F(k), F(k+1)) that the walk holds is shown beside the cells as it doubles and steps.
export default function BitDoublingView({ run, step }) {
  if (!run || !step) return <p className="bd-empty">Press Play to read n bit by bit.</p>;
  const { n } = run.input;
  const cells = step.bits.split("");
  const readCount = step.phase === "done" ? cells.length : step.phase === "bits" ? 0 : (step.readCount ?? 0);
  return (
    <section className="bd-view" aria-label="Fibonacci doubling along the binary digits of n">
      <p className="bd-caption">n = {n}, read in binary from the most significant digit</p>
      <ol className="bd-bits" aria-label={`Binary digits ${step.bits}`}>
        {cells.map((ch, i) => (
          <li key={i} className={[ch === "1" ? "bd-bit bd-bit--one" : "bd-bit", i < readCount ? "bd-bit--read" : ""].join(" ").trim()}>{ch}</li>
        ))}
      </ol>
      <dl className="bd-readout">
        <div><dt>F(k)</dt><dd>{step.a}</dd></div>
        <div><dt>F(k + 1)</dt><dd>{step.b}</dd></div>
        <div><dt>Doubled F(2k)</dt><dd>{step.c === null ? "-" : step.c}</dd></div>
        <div><dt>Doubled F(2k + 1)</dt><dd>{step.d === null ? "-" : step.d}</dd></div>
      </dl>
      <p className="bd-note">{step.message}</p>
    </section>
  );
}
