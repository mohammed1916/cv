import GraphTraversalView from '../../components/shared/GraphTraversalView'

// The grid with the cells already seen, the current cell and the queue, drawn with the shared grid view.
export default function View({ run, step }) {
  const grid = run.input
  const rows = grid.length
  const cols = grid[0].length
  const cells = grid.map(row => [...row])
  const seen = (step.snapshot.seen ?? []).map(k => k.split(',').map(Number))
  const frontier = step.snapshot.queue ?? []
  return <div className="food-grid-view">
    <GraphTraversalView title="Grid search" grid={{ rows, cols, cells, blocked: (r, c) => cells[r][c] === 'X' }}
      current={step.cell ?? null} visited={seen} frontier={frontier} frontierKind="queue" />
    <p>Distance: {step.distance ?? '-'}</p>
    <p>{step.message}</p>
  </div>
}
