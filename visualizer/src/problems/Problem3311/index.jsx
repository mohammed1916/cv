import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Corner', description: 'Pick a node with two neighbours.' },
    { id: 'row', label: 'Top row', description: 'Walk away from the second neighbour.' },
    { id: 'column', label: 'Column', description: 'Walk away from the first neighbour.' },
    { id: 'fill', label: 'Fill', description: 'Each cell is the node touching its upper and left cells.' },
    { id: 'check', label: 'Check', description: 'Every edge must join neighbouring cells.' },
    { id: 'done', label: 'Result', description: 'Return the grid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges (undirected pairs of node ids)',
  url: 'https://leetcode.com/problems/construct-2d-grid-matching-graph-layout/description/',
  complexity: 'Teaching model: O(n * (n + m)) with a BFS per walk. The visualization caps n at 16 nodes.',
  examples: [
    { label: 'Two by three', input: '{"n":6,"edges":[[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]]}' },
    { label: 'Single line', input: '{"n":4,"edges":[[2,0],[0,3],[3,1]]}' },
  ],
}

function gridSize(cells) {
  return {
    rows: Math.max(1, ...cells.map(cell => cell.r + 1)),
    cols: Math.max(1, ...cells.map(cell => cell.c + 1)),
  }
}

export default function ConstructGridLayout() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rows, cols } = gridSize(step.cells)
    const focus = step.focus
    const at = new Map(step.cells.map(cell => [`${cell.r},${cell.c}`, cell.node]))
    return <>
      <div role="grid" aria-label="Grid layout" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(3rem, 1fr))`, gap: 4, maxWidth: 420 }}>
        {Array.from({ length: rows * cols }, (_, index) => {
          const r = Math.floor(index / cols)
          const c = index % cols
          const node = at.get(`${r},${c}`)
          const current = focus && focus[0] === r && focus[1] === c
          return <div key={`${r}-${c}`} role="gridcell" data-row={r} data-col={c}
            style={{ border: `2px ${node === undefined ? 'dashed' : 'solid'} ${current ? 'var(--primary)' : 'var(--border, #94a3b8)'}`, borderRadius: 6, padding: '0.5rem 0', textAlign: 'center', opacity: node === undefined ? 0.45 : 1 }}>
            <strong>{node === undefined ? '·' : node}</strong>
            <small style={{ display: 'block' }}>{node === undefined ? '' : `(${r}, ${c})`}</small>
          </div>
        })}
      </div>
      <p>Placed {step.cells.length} of the nodes so far.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Distances from the two neighbours of the corner tell every node which way it lies. A node one step further from the second neighbour lies further along the top row.</p>
    <p>Once the top row and first column are known, each remaining cell has exactly one unplaced node adjacent to both its upper and left cells.</p>
    {step.phase === 'check' && <p>Every edge joins two cells that touch, which confirms the layout.</p>}
  </>} />
}
