import "./ColumnChainView.css";

export default function ColumnChainView({ run, step }) {
  if (!run || !step) return null;
  const { grid, limit } = run.input;
  const cols = grid[0].length;
  const pairRow = step.phase === "pair" ? step.row : -1;
  return (
    <div className="colchain" role="img" aria-label={`Grid with ${grid.length} rows and ${cols} columns, limit ${limit}`}>
      <table className="colchain__grid">
        <thead>
          <tr>
            <th scope="col">row</th>
            {Array.from({ length: cols }, (_, c) => {
              const classes = [];
              if (c === step.j) classes.push("colchain--current");
              if (c === step.i) classes.push("colchain--other");
              return <th key={c} scope="col" className={classes.join(" ")}>col {c}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r} className={r === pairRow ? "colchain__row--fail" : ""}>
              <th scope="row">{r}</th>
              {row.map((v, c) => <td key={c} className={c === step.j ? "colchain--current" : c === step.i ? "colchain--other" : ""}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="colchain__lengths" aria-label="Best chain length ending at each column">
        {step.length.map((len, c) => (
          <div key={c} className={`colchain__len${c === step.j ? " colchain__len--current" : ""}`}>
            <span>col {c}</span><strong>{len || "-"}</strong>
          </div>
        ))}
      </div>
      <div className="colchain__legend">
        <span>Limit <strong>{limit}</strong></span>
        {step.i >= 0 && <span>Pair {step.i} to {step.j}: {step.ok ? "fits every row" : `row ${step.row} is too far apart`}</span>}
        <span>Best <strong>{step.best}</strong></span>
      </div>
    </div>
  );
}
