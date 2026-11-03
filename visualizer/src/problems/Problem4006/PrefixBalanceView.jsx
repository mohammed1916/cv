import "./PrefixBalanceView.css";

export default function PrefixBalanceView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pb-view" aria-label="Valid prefixes">
        <p className="pb-empty">Press Play to read the string one bit at a time.</p>
      </section>
    );
  }

  const bits = run.input.s;
  const diff = step.ones - step.zeros;
  const limit = 6;
  const shown = Math.max(-limit, Math.min(limit, diff));

  return (
    <section className="pb-view" aria-label="Valid prefixes">
      <div className="pb-bits">
        {[...bits].map((bit, i) => {
          const inPrefix = i <= step.at;
          return (
            <span
              key={i}
              className={`pb-bit${bit === "1" ? " pb-bit--one" : " pb-bit--zero"}${inPrefix ? " pb-bit--in" : ""}${step.at === i ? " pb-bit--active" : ""}`}
            >
              {bit}
            </span>
          );
        })}
      </div>
      <div className="pb-balance" role="img" aria-label={`ones minus zeros is ${diff}`}>
        <div className="pb-axis" />
        <div
          className={`pb-marker${step.ok === false ? " pb-marker--off" : ""}`}
          style={{ left: `${50 + (shown / limit) * 50}%` }}
        />
        <span className="pb-tick pb-tick--left">zeros lead</span>
        <span className="pb-tick pb-tick--right">ones lead</span>
      </div>
      <p className="pb-status">
        Ones {step.ones}, zeros {step.zeros}, difference {diff}. Valid prefixes so far: {step.count}.
      </p>
      <p className="pb-status">{step.message}</p>
    </section>
  );
}
