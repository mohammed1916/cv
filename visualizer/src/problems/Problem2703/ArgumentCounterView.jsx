import "./ArgumentCounterView.css";

// Each argument is a chip; the counter climbs by one for every chip, including undefined ones.
export default function ArgumentCounterView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ac-view" aria-label="Argument counter">
        <p className="ac-empty">Press Play to count the arguments one by one.</p>
      </section>
    );
  }
  const { args } = run.input;
  return (
    <section className="ac-view" aria-label="Argument counter">
      <ol className="ac-args" aria-label="Arguments">
        {args.map((v, i) => {
          const counted = i < step.count;
          const current = step.index === i;
          const undef = v === null;
          return (
            <li key={i} className={`ac-arg${counted ? " ac-arg--counted" : ""}${current ? " ac-arg--current" : ""}${undef ? " ac-arg--undefined" : ""}`}>
              <span className="ac-arg-value">{undef ? "undefined" : JSON.stringify(v)}</span>
              <span className="ac-arg-index">#{i + 1}</span>
            </li>
          );
        })}
        {args.length === 0 && <li className="ac-empty">no arguments</li>}
      </ol>
      <output className="ac-counter" aria-label="Count">count {step.count}</output>
    </section>
  );
}
