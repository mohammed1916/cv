import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Rotate', description: 'Rotate each point to x + y and x - y.' },
    { id: 'remove', label: 'Remove', description: 'Remove one point and read the spread of the rest.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest spread found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points, a list of [x, y] pairs (JSON)',
  url: 'https://leetcode.com/problems/minimize-manhattan-distances/',
  complexity: 'O(n log n) time for the sorts and O(1) per removal. The visualization caps input at 8 points.',
  examples: [
    { label: 'Example', input: '{"points":[[3,10],[5,15],[10,2],[4,4]]}' },
    { label: 'Three points', input: '{"points":[[0,0],[1,0],[5,0]]}' },
  ],
}

export default function MinimizeManhattan() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Points (removed point is marked)" length={run.input.points.length}
      valueAt={i => `(${run.input.points[i][0]}, ${run.input.points[i][1]})`}
      active={Math.max(0, step.removed)} roleAt={i => (i === step.removed ? 'removed' : '')} />
    <output aria-label="Best spread">{`Spread after removal: ${step.distance ?? '-'}; best so far: ${step.best ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Manhattan distance |dx| + |dy| equals the larger of |ds| and |dt| when s = x + y and t = x - y, so the maximum distance is the larger spread of s and t.</p>
    <p>Removing one point changes the spread only if it was an extreme, so the two extremes of each list are enough.</p>
  </>} />
}
