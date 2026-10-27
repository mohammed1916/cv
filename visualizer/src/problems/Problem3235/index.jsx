import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'corner', label: 'Corners', description: 'Check whether a circle covers the start or the target corner.' },
    { id: 'reach', label: 'Top-left wall', description: 'Circles touching the top or left edge start the wall.' },
    { id: 'visit', label: 'Grow wall', description: 'Follow circles that overlap the wall.' },
    { id: 'wall', label: 'Wall closed', description: 'A circle reached the bottom or right edge, so the corner is blocked.' },
    { id: 'done', label: 'Complete', description: 'Report whether the target corner is reachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rectangle (JSON object with x, y, and circles as [cx, cy, r])',
  url: 'https://leetcode.com/problems/check-if-the-rectangle-corner-is-reachable/',
  complexity: 'O(n^2) time for n circles. The visualization caps input at 5 circles on a 10 by 10 rectangle.',
  examples: [
    { label: 'Reachable', input: '{"x":3,"y":3,"circles":[[2,1,1]]}' },
    { label: 'Blocked', input: '{"x":3,"y":3,"circles":[[1,1,3]]}' },
  ],
}

export default function CornerReachable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Circles" length={run.input.circles.length}
      valueAt={i => `(${run.input.circles[i][0]}, ${run.input.circles[i][1]}) r=${run.input.circles[i][2]}`}
      active={step.circle ?? -1}
      roleAt={i => (step.seen[i] ? 'in wall' : 'free')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The start is the bottom-left corner and the target is the top-right corner. Walls made of the outer edges split the boundary into two arcs.</p>
    <p>The corner is blocked exactly when a chain of overlapping circles links an arc touching the top or left edges to one touching the bottom or right edges.</p>
  </>} />
}
