import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Clear the difference array for points 0 through 101.' },
    { id: 'mark', label: 'Mark cars', description: 'Add one at each car’s start and remove it just after its end.' },
    { id: 'sweep', label: 'Sweep points', description: 'Add the running total to each point and count the covered ones.' },
    { id: 'done', label: 'Complete', description: 'Report how many points are covered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums as [start, end] pairs (1 to 100)',
  url: 'https://leetcode.com/problems/points-that-intersect-with-cars/',
  complexity: 'O(n + 100) time and O(100) space for n cars.',
  examples: [
    { label: 'Example 1', input: '{"nums":[[3,6],[1,5],[4,7]]}' },
    { label: 'Example 2', input: '{"nums":[[1,3],[5,8]]}' },
  ],
}

export default function PointsWithCars() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const covered = new Set(run.input.nums.flatMap(([s, e]) => Array.from({ length: e - s + 1 }, (_, i) => s + i)))
    return <>
      <IndexedSequence label="Points 1 to 100" length={100} indexOffset={1}
        valueAt={i => (covered.has(i + 1) ? 'covered' : 'open')}
        active={step.point === null ? -1 : step.point - 1}
        roleAt={i => (step.point !== null && i + 1 <= step.point && covered.has(i + 1) ? 'counted' : '')} />
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each car adds one at its start and removes one just after its end. A running total over the points is positive exactly where some car is present.</p>
    <p>Sweeping the 100 points once gives the answer without checking every car for every point.</p>
  </>} />
}
