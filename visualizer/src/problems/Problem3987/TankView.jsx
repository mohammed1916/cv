import "./TankView.css";

export default function TankView({ run, step }) {
  if (!run || !step) return null;
  const { demands, k } = run.input;
  const capacity = Math.max(k, ...demands, step.available ?? 0) * 1.1;
  const fill = Math.max(0, Math.min(100, ((step.available ?? 0) / capacity) * 100));
  const demandNeed = step.d !== null && step.d !== undefined ? Math.min(100, (step.d / capacity) * 100) : null;
  return (
    <div className="tank" role="img" aria-label={`Resource tank with ${step.available} units available`}>
      <div className="tank__stage">
        <div className="tank__gauge" aria-hidden="true">
          <div className="tank__level" style={{ height: `${fill}%` }} />
          {demandNeed !== null && <div className="tank__need" style={{ bottom: `${demandNeed}%` }}><span>demand {step.d}</span></div>}
        </div>
        <div className="tank__stats">
          <span>Available: <strong>{step.available}</strong></span>
          <span>Refill size k: <strong>{k}</strong></span>
          <span>Refills bought: <strong>{step.bought}</strong></span>
          <span>Cost so far: <strong>{step.cost}</strong></span>
        </div>
      </div>
      <ol className="tank__demands" aria-label="Demands in order">
        {demands.map((value, idx) => {
          const state = step.demand === null || step.demand === undefined ? "" : idx < step.demand ? "done" : idx === step.demand ? "now" : "";
          return <li key={idx} className={`tank__chip ${state ? `tank__chip--${state}` : ""}`}>{value}</li>;
        })}
      </ol>
    </div>
  );
}
