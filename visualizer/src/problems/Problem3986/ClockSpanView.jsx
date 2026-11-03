import "./ClockSpanView.css";

function Column({ label, clock, parts, active }) {
  return (
    <div className={`clockspan__col${active ? " clockspan__col--active" : ""}`}>
      <span className="clockspan__label">{label}</span>
      <span className="clockspan__clock">{clock}</span>
      {parts ? (
        <ul className="clockspan__parts">
          <li>{parts.hours} h x 3600 = {parts.hours * 3600}</li>
          <li>{parts.minutes} m x 60 = {parts.minutes * 60}</li>
          <li>{parts.seconds} s</li>
          <li><strong>= {parts.total} s</strong></li>
        </ul>
      ) : <span className="clockspan__pending">not yet converted</span>}
    </div>
  );
}

export default function ClockSpanView({ run, step }) {
  if (!run || !step) return null;
  const { start, end } = run.input;
  const active = step.at;
  return (
    <div className="clockspan" role="img" aria-label={`Elapsed time from ${start} to ${end}`}>
      <div className="clockspan__pair">
        <Column label="Start" clock={start} parts={step.a} active={active === "start"} />
        <span className="clockspan__arrow" aria-hidden="true">to</span>
        <Column label="End" clock={end} parts={step.b} active={active === "end"} />
      </div>
      <div className={`clockspan__result${active === "diff" || active === "done" ? " clockspan__result--show" : ""}`}>
        {step.elapsed !== null && step.elapsed !== undefined ? <>Elapsed: <strong>{step.elapsed}</strong> seconds</> : "Subtract the start seconds from the end seconds."}
      </div>
    </div>
  );
}
