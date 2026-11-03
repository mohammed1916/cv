import "./QueenBoardView.css";

const squareKey = ([r, c]) => `${r},${c}`;

export default function QueenBoardView({ run, step }) {
  if (!run || !step) {
    return <section className="qb-view"><p className="qb-empty">Press Play to see whether one queen move or a pivot square connects the two squares.</p></section>;
  }
  const { source, target } = run.input;
  const pivot = step.pivot ? squareKey(step.pivot) : null;
  const sourceKey = squareKey(source);
  const targetKey = squareKey(target);
  const squares = [];
  for (let r = 1; r <= 8; r++) {
    for (let c = 1; c <= 8; c++) {
      const key = squareKey([r, c]);
      const dark = (r + c) % 2 === 1;
      let mark = "";
      let label = "";
      if (key === sourceKey) { mark = "qb-square--source"; label = "S"; }
      else if (key === targetKey) { mark = "qb-square--target"; label = "T"; }
      else if (key === pivot) { mark = "qb-square--pivot"; label = "P"; }
      const onLine = step.phase === "line" && !mark && (r === source[0] || c === source[1] || Math.abs(r - source[0]) === Math.abs(c - source[1]));
      squares.push(
        <div key={key} className={`qb-square ${dark ? "qb-square--dark" : "qb-square--light"} ${mark} ${onLine ? "qb-square--line" : ""}`}
          aria-label={`row ${r} column ${c}${label ? ` ${label}` : ""}`}>
          {label && <span className="qb-tag">{label}</span>}
        </div>,
      );
    }
  }
  const result = step.result;
  return (
    <section className="qb-view" aria-label="Queen board">
      <div className="qb-board" role="grid">{squares}</div>
      <p className="qb-caption" role="status">
        {step.message}{result !== null && result !== undefined ? ` Minimum moves: ${result}.` : ""}
      </p>
      <p className="qb-legend">S source, T target, P pivot. Outlined squares share a row, column or diagonal with the source.</p>
    </section>
  );
}
