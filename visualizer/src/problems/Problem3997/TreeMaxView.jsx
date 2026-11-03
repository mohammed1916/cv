import "./TreeMaxView.css";

export default function TreeMaxView({ run, step }) {
  if (!run || !step) return null;
  const values = run.input;
  const n = values.length;
  const levels = [];
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    (levels[level] ??= []).push(i);
  }
  const done = step.phase === "done";
  return (
    <div className="treemax" role="img" aria-label={`Complete binary tree with ${n} nodes`}>
      {levels.map((ids, level) => (
        <div key={level} className="treemax__level">
          {ids.map(i => {
            const classes = ["treemax__node"];
            if (i === step.at) classes.push("treemax__node--now");
            if (step.dominant?.includes(i)) classes.push("treemax__node--dom");
            return (
              <div key={i} className={classes.join(" ")}>
                <span className="treemax__idx">#{i}</span>
                <strong>{values[i]}</strong>
                {step.best && <span className="treemax__best">max {step.best[i]}</span>}
              </div>
            );
          })}
        </div>
      ))}
      <div className="treemax__legend">
        <span>Dominant so far <strong>{step.count}</strong></span>
        {done ? <span>Final count <strong>{step.count}</strong></span> : <span>{step.message}</span>}
      </div>
    </div>
  );
}
