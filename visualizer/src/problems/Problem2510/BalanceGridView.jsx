import "./BalanceGridView.css";

// Grid of 0 and 1 cells. Each cell shows the balances (zeros minus ones) that reach it; the current cell is outlined.
export default function BalanceGridView({ run, step }) {
  if (!run || !step) {
    return <section className="balance-view" aria-label="Balanced path grid"><p className="balance-empty">Press Play to fill the balance table.</p></section>;
  }
  const grid = run.input;
  const m = grid.length, n = grid[0].length;
  const [ar, ac] = step.cell || [-1, -1];
  return (
    <section className="balance-view" aria-label="Balanced path grid">
      <div className="balance-grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(84px, 1fr))` }}>
        {Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => {
          const set = step.reach[r][c];
          const filled = set.length > 0;
          const active = r === ar && c === ac;
          return (
            <div key={`${r}-${c}`} className={`balance-cell balance-cell--${grid[r][c] === 0 ? "zero" : "one"}${filled ? " balance-cell--filled" : ""}${active ? " balance-cell--active" : ""}`}>
              <span className="balance-cell__value">{grid[r][c]}</span>
              <span className="balance-cell__set">{filled ? `{${set.map(b => (b > 0 ? `+${b}` : `${b}`)).join(" ")}}` : "-"}</span>
            </div>
          );
        }))}
      </div>
      <p className="balance-note">Each cell lists the balances (+ for zeros, - for ones) of paths reaching it from the top-left. Zero at the bottom-right means a balanced path.</p>
      <p className="balance-verdict">{step.phase === "done" ? (step.reach[m - 1][n - 1].includes(0) ? "Zero is reachable at the bottom-right." : "Zero is not reachable at the bottom-right.") : ""}</p>
    </section>
  );
}
