import "./SortedRowsView.css";

// The matrix with the current probe. Cells at most mid are shaded; per-row counts appear at the row ends.
export default function SortedRowsView({ run, step }) {
  if (!run || !step) {
    return <section className="median-view" aria-label="Sorted rows median"><p className="median-empty">Press Play to narrow the value range.</p></section>;
  }
  const rows = run.input;
  const n = rows[0].length;
  return (
    <section className="median-view" aria-label="Sorted rows median">
      <dl className="median-range" aria-label="Search range">
        <div><dt>Low</dt><dd>{step.lo}</dd></div>
        <div><dt>High</dt><dd>{step.hi}</dd></div>
        <div><dt>Probe</dt><dd>{step.mid ?? "-"}</dd></div>
        <div><dt>Need at most probe</dt><dd>{step.need}</dd></div>
      </dl>
      <table className="median-table">
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((v, c) => {
                const atMost = step.mid !== null && step.mid !== undefined && v <= step.mid;
                return <td key={c} className={atMost ? "median-cell median-cell--le" : "median-cell"}>{v}</td>;
              })}
              <td className="median-count">{step.perRow[r] !== undefined ? `${step.perRow[r]} ≤ mid` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="median-total">{step.count !== null ? `Total at most ${step.mid}: ${step.count} of ${rows.length * n} (need ${step.need}).` : step.mid !== null ? "Shaded cells are at most the probe." : ""}</p>
    </section>
  );
}
