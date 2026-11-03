import "./TripletCheckView.css";

// The array as tiles. The three indices being checked are outlined, each carries a
// divisibility mark (divides the sum or not), and the tally shows qualifying triples so far.
export default function TripletCheckView({ run, step }) {
  const nums = run.input.nums;
  const idx = step.indices ?? [];
  const role = i => {
    const pos = idx.indexOf(i);
    return pos === -1 ? "" : `is-pick is-pick-${pos}`;
  };

  return (
    <div className="tcv" aria-label="Array with the current triple">
      <div className="tcv__tiles" role="list">
        {nums.map((v, i) => {
          const pos = idx.indexOf(i);
          const mark = pos !== -1 && step.hitFlags ? (step.hitFlags[pos] ? "divides" : "no") : null;
          return (
            <div role="listitem" key={i} className={`tcv__tile ${role(i)}`}>
              <small>index {i}</small>
              <strong>{v}</strong>
              {mark && <span className={`tcv__mark tcv__mark--${mark}`}>{mark === "divides" ? "divides sum" : "does not"}</span>}
            </div>
          );
        })}
      </div>

      <div className="tcv__sum" aria-live="polite">
        {idx.length === 0 ? (
          <span>Waiting for the first triple.</span>
        ) : (
          <span>
            Triple ({idx.join(", ")}): sum <strong>{step.total}</strong>,{" "}
            divisible by <strong>{step.hits ?? "?"}</strong> of the three values
          </span>
        )}
      </div>

      <div className="tcv__tally">
        <span>Unordered triples with exactly one divisor: <strong>{step.singles}</strong></span>
        <span>Answer so far (times 6): <strong>{step.answer}</strong></span>
      </div>
    </div>
  );
}
