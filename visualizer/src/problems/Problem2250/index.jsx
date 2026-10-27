import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Buckets', description: 'Create one bucket per height from 0 to 100.' },
    { id: 'bucket', label: 'Bucket rectangles', description: 'Place each rectangle in its height bucket, then sort the buckets.' },
    { id: 'point', label: 'Count point', description: 'Count the lengths that reach the point in every bucket at or above y.' },
    { id: 'done', label: 'Complete', description: 'Return the counts in point order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rectangles [length, height] and points [x, y] (JSON)',
  url: 'https://leetcode.com/problems/count-number-of-rectangles-containing-each-point/',
  complexity: 'O(R log R + P * H log R) time with H = 101 height buckets. The visualization caps input at 12 rectangles and 12 points.',
  examples: [
    { label: 'Example 1', input: '{"rectangles":[[1,2],[2,3],[2,5]],"points":[[2,1],[1,4]]}' },
    { label: 'Example 2', input: '{"rectangles":[[1,1],[2,2],[3,3]],"points":[[1,3],[1,1]]}' },
  ],
}

export default function CountRectanglesContainingPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Rectangles placed (length, height)" length={run.input.rectangles.length} active={step.rect}
      valueAt={i => `(${run.input.rectangles[i][0]}, ${run.input.rectangles[i][1]})`} />
    <IndexedSequence label="Points (x, y) and rectangles containing them" length={run.input.points.length} active={step.point}
      valueAt={i => (step.counts[i] === undefined ? `(${run.input.points[i][0]}, ${run.input.points[i][1]})` : step.counts[i])} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A rectangle contains a point when the point’s x is at most the length and its y is at most the height. Grouping by height lets each point skip every rectangle that is too short.</p>
  </>} />
}
