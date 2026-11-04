import "./SortedRowsView.css";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";
import IndexedSequence from "../../components/shared/IndexedSequence";

// The matrix with the current probe, the answer range, and the flattened sorted order with the median marked.
export default function SortedRowsView({ run, step }) {
  if (!run || !step) {
    return <section className="median-view" aria-label="Sorted rows median"><p className="median-empty">Press Play to narrow the value range.</p></section>;
  }
  const rows = run.input;
  const n = rows[0].length;
  const sorted = rows.flat().sort((a, b) => a - b);
  const medianAt = step.need - 1;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const hasCount = step.count !== null && step.count !== undefined;
  return (
    <section className="median-view" aria-label="Sorted rows median">
      <AnswerRangeBar title="Value range for the median" min={min} max={max} low={step.lo} high={step.hi} probe={step.mid ?? null} verdict={hasCount ? step.count >= step.need : null} />
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
      <p className="median-total">{hasCount ? `Total at most ${step.mid}: ${step.count} of ${rows.length * n} (need ${step.need}).` : step.mid !== null ? "Shaded cells are at most the probe." : ""}</p>
      <IndexedSequence label={`Sorted order (median is the ${step.need}th value)`} length={sorted.length} valueAt={i => sorted[i]} roleAt={i => (i === medianAt ? "median" : "")} />
    </section>
  );
}
