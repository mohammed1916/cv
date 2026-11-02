import "./SnailGridView.css";

export default function SnailGridView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="sg-view" aria-label="Snail traversal">
        <p className="sg-empty">Press Play to fill the grid column by column, zig-zagging down and up.</p>
      </section>
    );
  }

  const view = step.view;
  const { arr, rows, cols, matrix, order, cursor, k, direction, column, mismatch, answer } = view;

  if (mismatch) {
    return (
      <section className="sg-view" aria-label="Snail traversal size mismatch">
        <header className="sg-head">
          <strong>{rows} × {cols} = {rows * cols} cells</strong>
          <span className="sg-badge sg-badge--bad">array has {arr.length} values</span>
        </header>
        <div className="sg-mismatch">The sizes differ, so the result is an empty list [].</div>
      </section>
    );
  }

  return (
    <section className="sg-view" aria-label="Snail traversal grid">
      <header className="sg-head">
        <strong>{rows} × {cols} grid</strong>
        <span className="sg-badge">next index k = {k}</span>
      </header>

      <div className="sg-input" aria-label="Input array in order">
        <span className="sg-input__label">arr</span>
        {arr.map((value, index) => (
          <span
            key={index}
            className={`sg-input__cell ${index < k ? "sg-input__cell--used" : ""} ${index === k && !answer ? "sg-input__cell--next" : ""}`}
            title={`arr[${index}]`}
          >
            {value}
          </span>
        ))}
      </div>

      <div className="sg-grid-wrap">
        <div className="sg-col-heads" style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))` }}>
          {Array.from({ length: cols }, (_, c) => (
            <span
              key={c}
              className={`sg-col-head ${column === c ? "sg-col-head--active" : ""}`}
            >
              {column === c ? (direction === "down" ? "↓" : "↑") : c % 2 === 0 ? "↓" : "↑"} c{c}
            </span>
          ))}
        </div>
        <div className="sg-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))` }} role="table">
          {matrix.map((row, r) =>
            row.map((value, c) => {
              const filled = value !== null && value !== undefined;
              const isCursor = cursor && cursor.row === r && cursor.col === c;
              const cls = [
                "sg-cell",
                filled ? "sg-cell--filled" : "sg-cell--empty",
                c % 2 === 1 ? "sg-cell--odd" : "",
                isCursor ? "sg-cell--cursor" : "",
              ].join(" ");
              return (
                <div key={`${r}-${c}`} className={cls} role="cell" title={filled ? `row ${r}, column ${c}, from arr[${order[r][c]}]` : `row ${r}, column ${c}, empty`}>
                  <b>{filled ? value : "·"}</b>
                  {filled && <small>#{order[r][c]}</small>}
                </div>
              );
            }),
          )}
        </div>
      </div>
      <p className="sg-legend">
        Columns alternate: even columns run down, odd columns run up. The small number is the array index that filled the cell.
      </p>
    </section>
  );
}
