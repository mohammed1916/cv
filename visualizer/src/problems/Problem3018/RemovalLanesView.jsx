import "./RemovalLanesView.css";

// One lane per surviving state. The open window between the front pointer x and back pointer y is still available.
export default function RemovalLanesView({ run, step }) {
  if (!run || !step) {
    return <section className="rl-view" aria-label="Removal states"><p className="rl-empty">Press Play to track every way the queries can consume nums.</p></section>;
  }
  const { nums, queries } = run.input;
  const n = nums.length;
  const lanes = step.states;

  const laneCells = (x, y) => nums.map((v, i) => {
    let cls = "rl-cell";
    if (i <= x) cls += " rl-cell--front";
    else if (i >= y) cls += " rl-cell--back";
    else cls += " rl-cell--open";
    if (step.from && step.from[0] === x && step.from[1] === y && step.to) {
      if (i === step.to[0] && step.to[0] !== x) cls += " rl-cell--picked";
      if (i === step.to[1] && step.to[1] !== y) cls += " rl-cell--picked";
    }
    if (step.q !== null && step.q !== undefined && v >= step.q && i > x && i < y) cls += " rl-cell--qualifies";
    return (
      <div key={i} className={cls}>
        <span className="rl-idx">{i}</span>
        <span className="rl-val">{v}</span>
      </div>
    );
  });

  return (
    <section className="rl-view" aria-label="Removal states across nums">
      <div className="rl-head">
        {step.q !== null && step.q !== undefined ? <span className="rl-query">{`Query value q = ${step.q}`}</span> : <span className="rl-query">{"Queries are processed in order"}</span>}
        <span className="rl-query">{`Processed: ${step.processed} of ${queries.length}`}</span>
      </div>
      {lanes.map(([x, y], k) => (
        <div key={`${x}-${y}-${k}`} className={`rl-lane${step.from && step.from[0] === x && step.from[1] === y ? " rl-lane--active" : ""}`}>
          <div className="rl-lane-label">{`front ${x < 0 ? "start" : `after ${x}`}, back ${y >= n ? "end" : `before ${y}`}`}</div>
          <div className="rl-row">{laneCells(x, y)}</div>
        </div>
      ))}
      {step.next && step.next.length && step.phase !== "advance" ? (
        <p className="rl-next">{`Next states being built: ${step.next.map(([x, y]) => `(${x}, ${y})`).join(" ")}`}</p>
      ) : null}
      {step.phase === "stop" ? <p className="rl-stop" role="status">No state can take this query, so the process stops.</p> : null}
      <output aria-label="Processed count" className="rl-count">{`Queries processed: ${step.processed}`}</output>
    </section>
  );
}
