import "./PrefixPieceView.css";

// The array with the piece under test drawn as a bracket; the dp row shows the fewest pieces per prefix.
export default function PrefixPieceView({ run, step }) {
  if (!run || !step) {
    return <section className="split-view" aria-label="Valid split"><p className="split-empty">Press Play to fill the prefix table.</p></section>;
  }
  const nums = run.input;
  const n = nums.length;
  const { i, j } = step;
  return (
    <section className="split-view" aria-label="Valid split">
      <div className="split-array" role="list">
        {nums.map((v, k) => {
          const inPiece = j !== null && j !== undefined && i > 0 && k >= j && k <= i - 1;
          return (
            <span key={k} role="listitem" className={`split-tile${inPiece ? (step.valid ? " split-tile--ok" : " split-tile--bad") : ""}${k === i - 1 && i > 0 ? " split-tile--end" : ""}`}>
              <span className="split-value">{v}</span>
              <span className="split-index">{k}</span>
            </span>
          );
        })}
      </div>
      {j !== null && j !== undefined && i > 0 && (
        <p className="split-piece">Piece nums[{j}..{i - 1}]: ends {nums[j]} and {nums[i - 1]}, gcd {step.gcd} {step.valid ? "(valid)" : "(not valid)"}</p>
      )}
      <table className="split-dp" aria-label="Fewest pieces per prefix">
        <thead><tr><th>prefix k</th>{Array.from({ length: n + 1 }, (_, k) => <th key={k}>{k}</th>)}</tr></thead>
        <tbody><tr><th>dp[k]</th>{step.dp.map((v, k) => <td key={k} className={k === i ? "split-dp__active" : ""}>{v === null ? "inf" : v}</td>)}</tr></tbody>
      </table>
      <p className="split-note">Shaded tiles are the piece under test; amber is the current prefix end. Green marks a valid piece.</p>
    </section>
  );
}
