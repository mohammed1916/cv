import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no valid pairs.' },
    { id: 'skip', label: 'Skip', description: 'The second point is not lower-right of the first.' },
    { id: 'blocked', label: 'Blocked', description: 'Another point sits inside or on the fence.' },
    { id: 'count', label: 'Count', description: 'The fence is empty, so the pair counts.' },
    { id: 'done', label: 'Result', description: 'Total valid pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 2 to 10 distinct points [x, y] with coordinates 0 to 50',
  url: 'https://leetcode.com/problems/find-the-number-of-ways-to-place-people-i/',
  complexity: 'O(n^3) time in this trace: every ordered pair is checked against every other point.',
  examples: [
    { label: 'Example 1', input: '[[2,5],[4,3],[6,1]]' },
    { label: 'Example 2', input: '[[0,4],[3,3],[1,0],[5,6]]' },
    { label: 'Two points', input: '[[1,2],[3,0]]' },
    { label: 'Shared column', input: '[[2,5],[2,1],[2,3]]' },
    { label: 'Corners and centre', input: '[[0,50],[50,0],[0,0],[50,50],[25,25]]' },
    { label: 'No valid pair', input: '[[0,0],[1,1]]' },
    { label: 'Long run: 10 points', input: '[[0,35],[18,8],[36,10],[18,27],[1,13],[6,46],[50,34],[7,31],[38,6],[36,22]]' },
  ],
}

export default function PlacePeopleI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <CoordinatePlane title="Points and the fence" points={run.input.map(([x, y], i) => {
      const isA = step.a && step.a[0] === x && step.a[1] === y
      const isB = step.b && step.b[0] === x && step.b[1] === y
      const isBlocker = step.blocker && step.blocker[0] === x && step.blocker[1] === y
      return { x, y, label: `${x},${y}`, role: isA || isB ? 'active' : isBlocker ? 'excluded' : 'kept' }
    })} rects={step.a && step.b ? [{ x1: step.a[0], y1: step.b[1], x2: step.b[0], y2: step.a[1], label: 'fence', role: step.blocker ? 'excluded' : 'active' }] : []} />
    <output aria-label="Pair being checked">{step.a ? `a = (${step.a[0]}, ${step.a[1]}), b = (${step.b[0]}, ${step.b[1]})${step.blocker ? `, blocked by (${step.blocker[0]}, ${step.blocker[1]})` : ''}` : 'no pair yet'}</output>
    <output aria-label="Valid pairs">{`valid pairs: ${step.count} of ${run.input.length} points`}</output>
  </>} renderReasoning={() => <>
    <p>Alice's point must be upper-left of Bob's point. The fence is the rectangle they span, and it must hold no other point on or inside its border.</p>
    <p>Each candidate pair is checked directly against every other point.</p>
  </>} />
}
