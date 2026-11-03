import "./UniqueMiddleView.css";

export default function UniqueMiddleView({ run, step }) {
  if (!run || !step) return null;
  const { input, mid } = run;
  return (
    <div className="umid" role="img" aria-label={`Array of ${input.length} values, middle index ${mid}`}>
      <div className="umid__row">
        {input.map((value, i) => {
          const classes = ["umid__cell"];
          if (i === mid) classes.push("umid__cell--mid");
          if (i === step.at) classes.push("umid__cell--scan");
          if (step.phase === "scan" && i === step.at && value === step.target) classes.push("umid__cell--match");
          return (
            <div key={i} className={classes.join(" ")}>
              <span className="umid__index">{i}</span>
              <span className="umid__value">{value}</span>
              {i === mid && <span className="umid__tag">middle</span>}
            </div>
          );
        })}
      </div>
      <div className="umid__summary">
        <span>Target: <strong>{step.target}</strong></span>
        <span>Occurrences so far: <strong>{step.count}</strong></span>
        {step.ok !== null && step.ok !== undefined && (
          <span className={step.ok ? "umid__badge umid__badge--yes" : "umid__badge umid__badge--no"}>
            {step.ok ? "Exactly once: true" : "Not once: false"}
          </span>
        )}
      </div>
    </div>
  );
}
