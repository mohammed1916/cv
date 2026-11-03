import "./TripletXorView.css";

function bitString(value, bits) {
  return value === null || value === undefined ? "" : value.toString(2).padStart(Math.max(bits, 1), "0");
}

export default function TripletXorView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="tx-view" aria-label="Triplet XOR counting">
        <p className="tx-empty">Press Play to walk every triple of picks.</p>
      </section>
    );
  }

  const picks = { a: step.i, b: step.j, c: step.k };
  const hasPick = step.i >= 0;
  const tag = step.phase === "even" ? "even" : step.phase === "odd" ? "odd" : null;

  return (
    <section className="tx-view" aria-label="Triplet XOR counting">
      {["a", "b", "c"].map((name) => (
        <div key={name} className="tx-lane">
          <span className="tx-name">{name}</span>
          <div className="tx-chips" role="list" aria-label={`Array ${name}`}>
            {step[name].map((v, idx) => (
              <span key={idx} role="listitem"
                className={`tx-chip${hasPick && picks[name] === idx ? " tx-chip--pick" : ""}`}>
                {v}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="tx-equation" aria-live="polite">
        {hasPick ? (
          <>
            <code>
              {step.a[step.i]} ^ {step.b[step.j]} ^ {step.c[step.k]} = {step.value}
            </code>
            <div>binary {bitString(step.value, step.value.toString(2).length)} has {step.bits} set bit{step.bits === 1 ? "" : "s"}</div>
            {tag && <span className={`tx-tag tx-tag--${tag}`}>{tag === "even" ? "even: counted" : "odd: skipped"}</span>}
          </>
        ) : (
          <span className="tx-empty">No triple chosen yet.</span>
        )}
      </div>
      <output className="tx-tally" aria-label="Counted triplets">Counted so far: {step.count}</output>
    </section>
  );
}
