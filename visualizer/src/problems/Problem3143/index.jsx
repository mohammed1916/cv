import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the points by distance from the origin.' },
    { id: 'take', label: 'Take ring', description: 'All points at this distance fit with distinct letters.' },
    { id: 'stop', label: 'Stop', description: 'A letter repeats, so the square cannot grow further.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points (distinct pairs, -10 to 10) and s (one letter per point) (JSON)',
  url: 'https://leetcode.com/problems/maximum-points-inside-the-square/',
  complexity: 'O(n log n) for the sort. The visualization caps input at 8 points.',
  examples: [
    { label: 'Example 1', input: '{"points":[[-2,-2],[0,0]],"s":"ab"}' },
    { label: 'Example 2', input: '{"points":[[1,1],[-1,-1],[2,-2]],"s":"ccd"}' },
  ],
}

export default function SquarePoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points, s } = run.input
    const dist = i => Math.max(Math.abs(points[i][0]), Math.abs(points[i][1]))
    const order = points.map((_, i) => i).sort((a, b) => dist(a) - dist(b) || a - b)
    return <>
      <IndexedSequence label="Points by distance" length={order.length}
        valueAt={k => `${s[order[k]]} at ${dist(order[k])}`}
        roleAt={k => (step.group.includes(order[k]) ? 'ring being taken' : (k < step.count ? 'inside' : ''))} />
      <output aria-label="Letters seen">{`Count ${step.count}, letters inside: ${step.seen.join(' ') || 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A square centred at the origin contains exactly the points closer than its side, so the candidate squares grow one distance at a time.</p>
    <p>All points at the same distance enter together, so a ring is either fully taken or the square stops before it.</p>
  </>} />
}
