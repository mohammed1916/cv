import { Fragment } from "react";
import "./StirlingTableView.css";

// Rows are candies 0..n, columns are bags 0..k. The current cell draws from the cell above (join) and above-left (new bag).
export default function Problem1692View({ run, step }) {
  const { n, k } = run.input;
  const table = step.table;
  const cell = (i, j) => {
    const cls = ["stir-cell"];
    if (i === step.i && j === step.j) cls.push(step.phase === "answer" ? "stir-cell--target" : "stir-cell--current");
    else if (step.phase === "cell" && i === step.i - 1 && (j === step.j || j === step.j - 1)) cls.push("stir-cell--source");
    return cls.join(" ");
  };
  return (
    <section className="stir-view" aria-label="Stirling table for distributing candies into bags">
      <div className="stir-grid" style={{ gridTemplateColumns: `repeat(${k + 2}, auto)` }}>
        <div className="stir-cell stir-cell--head">n\k</div>
        {Array.from({ length: k + 1 }, (_, j) => <div key={`h${j}`} className="stir-cell stir-cell--head">{j}</div>)}
        {Array.from({ length: n + 1 }, (_, i) => (
          <Fragment key={`row${i}`}>
            <div className="stir-cell stir-cell--head">{i}</div>
            {Array.from({ length: k + 1 }, (_, j) => (
              <div key={`${i}-${j}`} className={cell(i, j)}>{table[i][j]}</div>
            ))}
          </Fragment>
        ))}
      </div>
      {step.phase === "cell" && (
        <p className="stir-formula">{`S(${step.i}, ${step.j}) = ${step.j} x ${table[step.i - 1][step.j]} + ${table[step.i - 1][step.j - 1]} = ${table[step.i][step.j]}`}</p>
      )}
      <p className="stir-legend">Blue: cells that feed this one. Violet: the cell being filled. Green: the answer.</p>
      <p className="stir-message">{step.message}</p>
    </section>
  );
}
