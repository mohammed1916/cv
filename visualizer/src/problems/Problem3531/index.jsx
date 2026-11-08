import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function Plot({ run, step }) {
  const { n, buildings } = run.input
  const W = 300, pad = 20
  const at = v => pad + (v / Math.max(1, n - 1)) * (W - pad * 2)
  return <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Building positions on the grid" style={{ width: 260, maxWidth: '100%' }}>
    <rect x={pad} y={pad} width={W - pad * 2} height={W - pad * 2} fill="none" stroke="var(--surface2)" />
    {buildings.map(([x, y], index) => {
      const covered = step.covered.includes(index)
      const current = step.at === index
      return <g key={index}>
        <circle cx={at(x - 1)} cy={W - at(y - 1)} r={current ? 9 : 6}
          fill={current ? 'var(--primary)' : covered ? 'var(--text)' : 'transparent'} stroke="var(--text)" strokeWidth="1.5" />
        <text x={at(x - 1) + 9} y={W - at(y - 1) - 8} fontSize="11" fill="var(--text)">{index}</text>
      </g>
    })}
  </svg>
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No row or column has been measured.' },
    { id: 'extremes', label: 'Extremes', description: 'Record the outermost buildings of each row and column.' },
    { id: 'check', label: 'Check', description: 'Test whether a building lies strictly inside both extremes.' },
    { id: 'count', label: 'Covered', description: 'The building has neighbours on all four sides.' },
    { id: 'done', label: 'Result', description: 'Report the covered count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and buildings ([x, y] pairs, 1 to 30 buildings)',
  url: 'https://leetcode.com/problems/count-covered-buildings/',
  complexity: 'O(b) time and O(b) space for b buildings, using row and column extremes. The visualization caps the grid at 12 and the buildings at 30.',
  examples: [
    { label: 'Own case 1', input: '{"n":4,"buildings":[[2,3],[3,3],[4,3],[3,2],[3,4]]}' },
    { label: 'Own case 2', input: '{"n":4,"buildings":[[2,2],[2,3],[3,2],[3,3]]}' },
    { label: 'Own case 3', input: '{"n":6,"buildings":[[2,4],[4,3],[4,4],[4,6],[6,4]]}' },
    { label: 'Smallest grid, no cover', input: '{"n":2,"buildings":[[1,1],[2,2]]}' },
    { label: 'Full 3 by 3 block', input: '{"n":3,"buildings":[[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[3,1],[3,2],[3,3]]}' },
    { label: 'Corners of a 12 by 12 grid', input: '{"n":12,"buildings":[[1,1],[12,12],[1,12],[12,1]]}' },
    { label: 'Long run: 30 buildings on 12 by 12', input: '{"n":12,"buildings":[[10,7],[2,12],[1,7],[10,9],[6,7],[6,12],[1,2],[2,4],[11,4],[2,11],[5,3],[7,8],[8,2],[12,4],[5,1],[7,1],[9,6],[1,10],[3,5],[11,3],[3,6],[3,2],[1,12],[8,9],[5,6],[7,11],[6,8],[11,11],[4,2],[4,4]]}' },
  ],
}

export default function CountCoveredBuildings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Plot run={run} step={step} />
    <ol aria-label="Buildings">
      {run.input.buildings.map(([x, y], index) => <li key={index} data-role={step.at === index ? 'current' : step.covered.includes(index) ? 'covered' : ''}>
        {`(${x}, ${y})`}{step.at === index ? ' checked' : ''}{step.covered.includes(index) ? ' covered' : ''}</li>)}
    </ol>
    <output aria-label="Covered count">{`covered = ${step.covered.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A building is covered only if it has a building to its left and right in its row, and one below and one above in its column.</p>
    <p>Those four facts are checked against the outermost buildings of its row and column, so no pair of buildings has to be compared.</p>
  </>} />
}
