import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coordinates (JSON)',
  complexity: 'O(n) time and O(1) extra space: one cross product per point.',
  examples: [
    { label: 'Diagonal line', input: '{"coordinates":[[-6,-9],[-2,-1],[0,3],[3,9],[7,17],[10,23]]}' },
    { label: 'Vertical line', input: '{"coordinates":[[4,-3],[4,0],[4,8]]}' },
    { label: 'Off the line', input: '{"coordinates":[[1,2],[3,6],[5,11]]}' },
    { label: 'Two points', input: '{"coordinates":[[-8,3],[7,-4]]}' },
  ],
}

export default function StraightLineCheck() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { points, index, cross } = step.snapshot
    return <div aria-label="Points" style={{ display: 'grid', gap: 6, fontFamily: 'monospace' }}>
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {points.map(([x, y], i) => <li key={`${i}-${x}-${y}`} data-point={i} style={{
          fontWeight: i === index ? 700 : 400,
          color: i === index && cross !== null && cross !== 0 ? '#dc2626' : 'inherit',
        }}>({x}, {y}){i < 2 ? ' · sets direction' : ''}</li>)}
      </ol>
      <output aria-label="Cross product">{cross === null ? '' : `Cross product for the current point: ${cross}`}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
