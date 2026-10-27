import MatrixGrid from './MatrixGrid'
import { formatCell } from './distanceMatrixModel.js'
import './DistanceMatrixView.css'

/**
 * A distance or reachability matrix with its active cell and highlighted cells (a Floyd pivot's
 * row and column, or a grid's frontier), plus an optional ordered list such as a 0-1 BFS deque.
 */
export default function DistanceMatrixView({ label, matrix, activeCell = null, highlightedCells = [], queueLabel = '', queue = [] }) {
  const shown = matrix.map(row => row.map(formatCell))
  return <section className="distance-matrix-view" aria-label={label}>
    <MatrixGrid matrix={shown} label={label} activeCell={activeCell} highlightedCells={highlightedCells} cellWidth={48} cellHeight={44} />
    {queue.length > 0 && <div className="distance-matrix-view__queue" aria-label={queueLabel}>
      <h4>{queueLabel}</h4>
      <ol>{queue.map((item, i) => <li key={i} data-index={i}>{item}</li>)}</ol>
    </div>}
  </section>
}
