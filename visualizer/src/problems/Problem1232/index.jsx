import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
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
    const { points, index, cross, anchor, direction } = step.snapshot
    const planePoints = points.map(([x, y], i) => {
      let role = ''
      if (i < 2) role = 'kept'
      if (index !== null && i === index) role = cross !== null && cross !== 0 ? 'excluded' : 'active'
      return { x, y, label: i < 2 ? `p${i + 1}` : String(i + 1), role }
    })
    return <div style={{ display: 'grid', gap: 8 }}>
      <CoordinatePlane title="Points and the line through the first two" points={planePoints} />
      <p style={{ margin: 0, color: 'var(--text-dim)' }}>
        {direction ? `Direction (${direction[0]}, ${direction[1]}) from p1. Cross product for the current point: ${cross ?? '-'}.` : 'The first two points fix the direction.'}
      </p>
      <output aria-label="Cross product">{cross === null ? '' : `Anchor (${anchor[0]}, ${anchor[1]}) · cross ${cross}`}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
