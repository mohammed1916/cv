import "./ParityTallyView.css";

function parityOf(v) {
  let n = 0;
  for (let t = v; t > 0; t >>= 1) n += t & 1;
  return n % 2 === 0 ? "even" : "odd";
}

export default function ParityTallyView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pt-view" aria-label="Parity tally">
        <p className="pt-empty">Press Play to tally each array by set-bit parity.</p>
      </section>
    );
  }

  const names = ["a", "b", "c"];
  const tallies = step.tallies || {};
  const pairs = step.pairs;

  return (
    <section className="pt-view" aria-label="Parity tally">
      <div className="pt-columns">
        {names.map((name) => {
          const t = tallies[name];
          return (
            <div key={name} className={`pt-column${step.done === name ? " pt-column--active" : ""}`}>
              <h3 className="pt-title">Array {name}</h3>
              {t ? (
                <>
                  <div className="pt-bar pt-bar--even">even parity: {t.even}</div>
                  <div className="pt-bar pt-bar--odd">odd parity: {t.odd}</div>
                </>
              ) : (
                <p className="pt-empty">not tallied yet</p>
              )}
              <p className="pt-values">{step[name].map((v) => `${v}(${parityOf(v)[0]})`).join("  ")}</p>
            </div>
          );
        })}
      </div>
      <div className="pt-formula" aria-live="polite">
        {pairs ? (
          <>
            <span>even pairs (a,b): {pairs.even}</span>
            <span>odd pairs (a,b): {pairs.odd}</span>
          </>
        ) : (
          <span className="pt-empty">Pairs appear after both arrays are tallied.</span>
        )}
        <p>{step.message}</p>
      </div>
      <output className="pt-total" aria-label="Counted triplets">Counted: {step.result === null ? "not yet" : step.result}</output>
    </section>
  );
}
