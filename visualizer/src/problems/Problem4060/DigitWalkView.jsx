import "./DigitWalkView.css";

// The digits of the bound are shown as tiles. The position being walked is ringed, its even/odd
// status is tagged, and the running parity of even digits is shown beside the tiles.
export default function DigitWalkView({ run, step }) {
  if (!run || !step) return <p className="dw-empty">Press Play to walk the digits.</p>;
  const { l, r } = run.input;
  const digits = step.digits || [];
  return (
    <section className="dw-view" aria-label="Digit walk for the bound">
      <p className="dw-caption">Counting integers from {l} to {r}: {step.bound === null || step.bound === undefined ? "between bounds" : `bound ${step.bound}`}</p>
      {digits.length > 0 && (
        <ol className="dw-digits" aria-label={`Digits of ${step.bound}`}>
          {digits.map((d, i) => (
            <li key={i} className={[i === step.pos ? "dw-digit--now" : "", i < step.pos ? "dw-digit--past" : ""].join(" ").trim()}>
              <span className="dw-digit">{d}</span>
              <small>{d % 2 === 0 ? "even" : "odd"}</small>
            </li>
          ))}
        </ol>
      )}
      <dl className="dw-readout">
        <div><dt>Even-digit parity so far</dt><dd>{step.p === 0 ? "even (0)" : "odd (1)"}</dd></div>
        <div><dt>Added this step</dt><dd>{step.added}</dd></div>
        <div><dt>Running count</dt><dd>{step.total}</dd></div>
      </dl>
      <p className="dw-note">Digits of the bound that come before the walked position are fixed; a smaller digit there lets the rest run freely, and the table gives how many completions have the needed parity.</p>
    </section>
  );
}
