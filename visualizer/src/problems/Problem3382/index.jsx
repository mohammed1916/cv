import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best area to -1 (none found).' },
    { id: 'pair', label: 'Pair', description: 'Check whether the other two corners exist.' },
    { id: 'blocked', label: 'Blocked', description: 'Another point lies on or inside the rectangle.' },
    { id: 'accept', label: 'Accept', description: 'The rectangle is empty; compare its area.' },
    { id: 'done', label: 'Complete', description: 'Report the largest empty rectangle.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Points as JSON [[x, y], ...] (0 to 20)',
  url: 'https://leetcode.com/problems/maximum-area-rectangle-with-point-constraints-ii/',
  complexity: 'O(n^3) time for n points, O(n) extra space. The visualization caps input at 30 points.',
  examples: [
    { label: 'Square', input: '[[1,1],[1,3],[3,1],[3,3]]' },
    { label: 'Interior point', input: '[[1,1],[1,3],[3,1],[3,3],[2,2]]' },
    { label: 'Single point', input: '[[0,20]]' },
    { label: 'Equal row of points', input: '[[5,5],[5,6],[5,7]]' },
    { label: 'Largest coordinates', input: '[[0,0],[20,0],[0,20],[20,20]]' },
    { label: 'Long run: 30 points', input: '[[0,11],[0,1],[5,15],[18,13],[13,9],[9,0],[2,2],[1,9],[8,18],[9,7],[17,19],[8,1],[7,6],[7,10],[15,1],[18,12],[12,5],[19,2],[10,7],[7,13],[17,10],[10,9],[1,14],[5,3],[19,20],[20,11],[20,14],[7,20],[0,17],[14,5]]' },
  ],
}

export default function MaxRectangleIIPointConstraints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const points = run.input.map(([x, y]) => {
      const isCorner = step.pair && step.pair.some(([a, b]) => a === x && b === y)
      const isBlocker = step.blocked && step.blocked[0] === x && step.blocked[1] === y
      return { x, y, role: isBlocker ? 'excluded' : isCorner ? 'active' : undefined }
    })
    const rects = step.pair ? [{
      x1: Math.min(step.pair[0][0], step.pair[1][0]), y1: Math.min(step.pair[0][1], step.pair[1][1]),
      x2: Math.max(step.pair[0][0], step.pair[1][0]), y2: Math.max(step.pair[0][1], step.pair[1][1]),
      role: step.phase === 'accept' ? 'active' : undefined,
    }] : []
    return <>
      <CoordinatePlane title="Points and candidate rectangle" points={points} rects={rects} />
      <output aria-label="Best area">{`Best area so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>An empty rectangle is fixed by two opposite corners. Its other two corners must be points, and no other point may sit on or inside its border.</p>
    <p>Checking every pair of points as opposite corners covers every candidate rectangle exactly once.</p>
  </>} />
}
