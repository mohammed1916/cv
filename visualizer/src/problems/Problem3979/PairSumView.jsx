import "./PairSumView.css";

export default function PairSumView({ run, step }) {
  if (!run || !step) return null;
  const { nums, k } = run.input;
  const limit = step.j >= 0 ? step.i : -1;
  return (
    <div className="pairsum" role="img" aria-label={`Values with separation ${k}`}>
      <div className="pairsum__row">
        {nums.map((value, idx) => {
          const classes = ["pairsum__cell"];
          if (step.j >= 0 && idx <= limit) classes.push("pairsum__cell--allowed");
          if (idx === step.prefixIndex) classes.push("pairsum__cell--prefix");
          if (idx === step.j) classes.push("pairsum__cell--right");
          return (
            <div key={idx} className={classes.join(" ")}>
              <span className="pairsum__index">{idx}</span>
              <span className="pairsum__value">{value}</span>
              {idx === step.j && <span className="pairsum__tag">j</span>}
              {idx === step.prefixIndex && idx !== step.j && <span className="pairsum__tag pairsum__tag--prefix">best</span>}
            </div>
          );
        })}
      </div>
      <div className="pairsum__legend">
        <span>Gap k = <strong>{k}</strong></span>
        {step.j >= 0 && <span>Right end j = <strong>{step.j}</strong>, may pair with indices 0 to {limit}</span>}
        {step.candidate !== null && step.candidate !== undefined && <span>Candidate sum <strong>{step.candidate}</strong></span>}
        <span>Best so far <strong>{step.best ?? "none"}</strong></span>
      </div>
    </div>
  );
}
