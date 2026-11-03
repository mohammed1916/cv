import "./DroneRangeView.css";

export default function DroneRangeView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="dr-view" aria-label="Nearest available drone">
        <p className="dr-empty">Press Play to check each drone's Manhattan reach in index order.</p>
      </section>
    );
  }

  const [tx, ty] = run.input.target;
  const drones = run.input.drones;
  const maxRange = Math.max(1, ...drones.map(d => d[2]));

  return (
    <section className="dr-view" aria-label="Nearest available drone">
      <p className="dr-target">Target ({tx}, {ty})</p>
      <ul className="dr-list">
        {drones.map(([x, y, range], i) => {
          const distance = Math.abs(x - tx) + Math.abs(y - ty);
          const isCurrent = step.index === i;
          const isBest = step.best === i;
          const classes = ["dr-drone", isCurrent ? "dr-drone--current" : "", isBest ? "dr-drone--best" : ""].join(" ");
          return (
            <li key={i} className={classes}>
              <span className="dr-id">Drone {i} at ({x}, {y})</span>
              <span className="dr-track" aria-hidden="true">
                <span className="dr-track__range" style={{ width: `${(100 * range) / maxRange}%` }} />
                <span className="dr-track__dist" style={{ width: `${Math.min(100, (100 * distance) / maxRange)}%` }} />
              </span>
              <span className="dr-meta">
                distance {distance}, range {range}
                {isBest ? " - nearest so far" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="dr-answer">Answer so far: {step.best === -1 ? "none" : `drone ${step.best}`}{step.bestDistance !== null ? ` at distance ${step.bestDistance}` : ""}</p>
      <p className="dr-status">{step.message}</p>
    </section>
  );
}
