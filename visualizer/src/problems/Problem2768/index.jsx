import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the block counts.' },
    { id: 'cell', label: 'Black cell', description: 'Add it to every block that contains it.' },
    { id: 'done', label: 'Complete', description: 'Return the counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "m", "n" and "coordinates" ([row, column] pairs), JSON',
  url: 'https://leetcode.com/problems/number-of-black-blocks/',
  complexity: 'O(k) time for k black cells, plus O(m times n) to count the blocks. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Own case 1', input: '{"m":4,"n":4,"coordinates":[[1,1]]}' },
    { label: 'Own case 2', input: '{"m":4,"n":4,"coordinates":[[1,1],[2,2],[1,3]]}' },
    { label: 'Smallest grid, one black cell', input: '{"m":2,"n":2,"coordinates":[[0,0]]}' },
    { label: 'Two black cells in one row', input: '{"m":3,"n":3,"coordinates":[[1,0],[1,2]]}' },
    { label: 'Boundary: four corners of 8 by 8', input: '{"m":8,"n":8,"coordinates":[[0,0],[7,7],[0,7],[7,0]]}' },
    { label: 'Long run: 12 cells on 8 by 8', input: '{"m":8,"n":8,"coordinates":[[0,2],[1,5],[4,4],[3,3],[7,2],[6,0],[7,1],[2,3],[5,2],[0,0],[3,2],[5,6]]}' },
  ],
}

export default function NumberOfBlackBlocks() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        // The grid of cells, with the current black cell ringed; below it, each 2 by 2 block shows its black count.
        const { m, n, coordinates } = run.input
        const black = new Set(coordinates.map(([r, c]) => `${r},${c}`))
        const [cr, cc] = step.cell ?? [-1, -1]
        const blockCount = (top, left) => [[0, 0], [0, 1], [1, 0], [1, 1]].filter(([dr, dc]) => black.has(`${top + dr},${left + dc}`)).length
        const touching = (top, left) => cr >= top && cr <= top + 1 && cc >= left && cc <= left + 1
        return (
          <section aria-label="Grid and 2 by 2 blocks" style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 26px)`, gap: 3 }}>
              {Array.from({ length: m * n }, (_, k) => {
                const r = Math.floor(k / n), c = k % n
                const on = black.has(`${r},${c}`)
                return <div key={k} style={{ width: 26, height: 26, borderRadius: 4, background: on ? 'var(--primary)' : 'var(--surface2)', border: r === cr && c === cc ? '3px solid var(--warning)' : '1px solid var(--border)' }} />
              })}
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--text)', fontSize: 15 }}>Blocks and their black counts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, n - 1)}, 34px)`, gap: 3 }}>
                {Array.from({ length: Math.max(0, (m - 1) * (n - 1)) }, (_, k) => {
                  const top = Math.floor(k / (n - 1)), left = k % (n - 1)
                  const count = blockCount(top, left)
                  return <div key={k} title={`block at (${top}, ${left})`} style={{ height: 34, display: 'grid', placeItems: 'center', borderRadius: 4, color: 'var(--text)', border: touching(top, left) ? '2px solid var(--warning)' : '1px solid var(--border)', background: count ? 'var(--primary-glow)' : 'var(--surface)' }}>{count}</div>
                })}
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text)' }}>{step.message}</p>
          </section>
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
