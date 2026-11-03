import "./CoinBarsView.css";

export default function CoinBarsView({ run, step }) {
  const { prob, target } = run.input;
  const counts = step.dp.map((_, j) => j);
  const processed = step.coin < 0 ? 0 : step.phase === "done" ? prob.length : step.coin;
  const current = step.phase === "coin" || step.phase === "update" ? step.coin : -1;

  return (
    <figure className="cb-view" aria-label="Coin toss distribution">
      <ol className="cb-coins" aria-label="Coins">
        {prob.map((p, i) => {
          const state = i < processed ? "done" : i === current ? "now" : "wait";
          return (
            <li key={i} className={`cb-coin cb-${state}`}>
              <span className="cb-coin-name">Coin {i + 1}</span>
              <span className="cb-coin-p">heads {p}</span>
              <span className="cb-coin-tag">{state === "done" ? "tossed" : state === "now" ? "tossing" : "waiting"}</span>
            </li>
          );
        })}
      </ol>

      <div className="cb-bars" role="list" aria-label="Probability of each head count">
        {counts.map((j) => {
          const value = step.dp[j];
          const isTarget = j === target;
          const isUpdating = step.phase === "update" && j === step.j;
          const cls = ["cb-bar", isTarget ? "cb-target" : "", isUpdating ? "cb-updating" : ""].join(" ");
          return (
            <div key={j} className={cls} role="listitem">
              <span className="cb-value">{value.toFixed(3)}</span>
              <span className="cb-track">
                <span className="cb-fill" style={{ height: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
              </span>
              <span className="cb-label">{j} heads{isTarget ? " (asked)" : ""}</span>
            </div>
          );
        })}
      </div>

      <figcaption className="cb-caption">
        {step.phase === "update"
          ? `Rewriting the chance of ${step.j} heads after coin ${step.coin + 1}.`
          : step.phase === "done"
            ? `Answer: exactly ${target} heads has chance ${step.dp[target].toFixed(5)}.`
            : `Bars show the chance of each head count after ${processed} coin${processed === 1 ? "" : "s"}.`}
      </figcaption>
    </figure>
  );
}
