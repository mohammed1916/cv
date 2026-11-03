import "./DigitBlockView.css";

export default function DigitBlockView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="db-view" aria-label="Digit in the infinite string">
        <p className="db-empty">Press Play to skip whole groups of numbers, then locate the digit.</p>
      </section>
    );
  }

  const target = run.input.k;
  const block = step.block;
  const numbers = block === null || block === undefined ? [] : blockNumbers(block);
  const descending = block !== null && block !== undefined && block % 2 === 1;

  return (
    <section className="db-view" aria-label="Digit in the infinite string">
      <p className="db-target">Position {target} of the infinite digit string</p>
      {step.skipped.length > 0 && (
        <ul className="db-skips" aria-label="Skipped groups">
          {step.skipped.map((g, i) => (
            <li key={i}>{g.d}-digit numbers: {g.digits} digits skipped</li>
          ))}
        </ul>
      )}
      {block !== null && block !== undefined && (
        <>
          <p className="db-caption">
            Block {block} (numbers {10 * block} to {10 * block + 9}) is read {descending ? "descending" : "ascending"}.
          </p>
          <div className="db-block">
            {numbers.map((v) => (
              <span key={v} className={`db-number${step.number === v ? " db-number--active" : ""}`}>
                {String(v).split("").map((ch, t) => (
                  <span key={t} className={`db-digit${step.number === v && step.digit !== null && t === stepDigitIndex(step) ?" db-digit--hit" : ""}`}>{ch}</span>
                ))}
              </span>
            ))}
          </div>
        </>
      )}
      <p className="db-status">
        {step.result !== undefined && step.result !== null ? `Digit ${step.result}.` : `Remaining offset ${step.k}.`} {step.message}
      </p>
    </section>
  );
}

function blockNumbers(block) {
  const out = [];
  for (let v = block === 0 ? 1 : 10 * block; v <= 10 * block + 9; v++) out.push(v);
  return block % 2 === 1 ? out.reverse() : out;
}

function stepDigitIndex(step) {
  // Within the located block, the offset k-1 splits into a number index and a digit index.
  if (!step.d) return 0;
  return ((step.k - 1) % (10 * step.d)) % step.d;
}
