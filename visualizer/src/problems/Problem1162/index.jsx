import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

function DistanceGrid({ snapshot }) {
  const { grid, dist, current, reached, best } = snapshot
  const n = grid.length
  const key = (r, c) => `${r},${c}`
  const reachedSet = new Set((reached || []).map(([r, c]) => key(r, c)))
  const bestKey = best ? key(...best) : null
  return <div>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 44px)`, gap: 4 }}>
      {grid.flatMap((row, r) => row.map((value, c) => {
        const k = key(r, c)
        const isCurrent = current && current[0] === r && current[1] === c
        return <div key={k} style={{
          height: 44, borderRadius: 4, border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          background: 'var(--surface2)',
          outline: isCurrent ? '3px solid var(--primary)' : reachedSet.has(k) ? '2px dashed var(--primary)' : bestKey === k ? '2px solid var(--success)' : 'none',
        }}>
          <small>{value === 1 ? 'land' : 'water'}</small>
          <strong>{dist[r][c] === -1 ? '·' : dist[r][c]}</strong>
        </div>
      }))}
    </div>
    <p>Amber: cell being expanded. Dashed: newly reached. Green: farthest water so far.</p>
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Grid as JSON rows, e.g. [[1,0],[0,0]] (1 = land, 0 = water)',
  complexity: 'O(n²) time and space for an n by n grid. The trace accepts grids up to 6 by 6.',
  examples: [
    { label: 'Three land cells', input: '[[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,1]]' },
    { label: 'Corner land', input: '[[1,0],[0,0]]' },
    { label: 'All water', input: '[[0,0],[0,0]]' },
  ],
}

export default function LandDistanceWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <DistanceGrid snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
