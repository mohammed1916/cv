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
    { label: 'Horizontal line', input: '{\"coordinates\":[[-3,5],[0,5],[9,5]]}' },
    { label: 'Extreme corners on a diagonal', input: '{\"coordinates\":[[-10000,-10000],[0,0],[10000,10000]]}' },
    { label: 'Long run: forty points on a line', input: '{\"coordinates\":[[1281,3836],[-2847,-8548],[-719,-2164],[-1368,-4111],[-177,-538],[1810,5423],[-712,-2143],[-957,-2878],[-1531,-4600],[-850,-2557],[1721,5156],[-443,-1336],[-2359,-7084],[147,434],[-1169,-3514],[1465,4388],[-638,-1921],[-2770,-8317],[-1562,-4693],[-2049,-6154],[2665,7988],[2681,8036],[-2238,-6721],[559,1670],[879,2630],[460,1373],[-874,-2629],[893,2672],[-1848,-5551],[973,2912],[-1375,-4132],[-2203,-6616],[-1970,-5917],[-286,-865],[336,1001],[-287,-868],[2453,7352],[2269,6800],[2179,6530],[-2555,-7672]]}' },
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
