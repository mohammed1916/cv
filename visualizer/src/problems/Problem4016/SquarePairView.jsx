import "./SquarePairView.css";

export default function SquarePairView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="sq-view" aria-label="Two non-overlapping squares">
        <p className="sq-empty">Press Play to try the largest square side first.</p>
      </section>
    );
  }

  const { grid } = run.input;
  const side = step.side;
  const inSquares = (r, c) => side !== null && step.squares.some(([sr, sc]) => r >= sr && r < sr + side && c >= sc && c < sc + side);
  const inPair = (r, c, index) => {
    if (!step.pair) return false;
    const [sr, sc] = step.pair[index];
    return side !== null && r >= sr && r < sr + side && c >= sc && c < sc + side;
  };

  return (
    <section className="sq-view" aria-label="Two non-overlapping squares">
      <div className="sq-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 2rem)` }} role="img" aria-label="Binary grid with candidate squares">
        {grid.flatMap((row, r) =>
          row.map((v, c) => {
            const first = inPair(r, c, 0);
            const second = inPair(r, c, 1);
            const candidate = inSquares(r, c);
            const cls = [
              "sq-cell",
              v === 1 ? "sq-cell--one" : "sq-cell--zero",
              candidate ? "sq-cell--candidate" : "",
              first ? "sq-cell--first" : "",
              second ? "sq-cell--second" : "",
            ].join(" ");
            return <span key={`${r}-${c}`} className={cls}>{v}</span>;
          }),
        )}
      </div>
      <dl className="sq-cards">
        <div><dt>Side</dt><dd>{side ?? "-"}</dd></div>
        <div><dt>All-one squares</dt><dd>{side === null ? "-" : step.squares.length}</dd></div>
        <div><dt>Area</dt><dd>{step.result ?? "-"}</dd></div>
      </dl>
      <p className="sq-status">{step.message}</p>
    </section>
  );
}
