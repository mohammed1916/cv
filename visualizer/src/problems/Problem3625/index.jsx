import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ParallelSegmentsView from './ParallelSegmentsView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points, a list of [x, y] pairs',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n²) time and space over all pairs of points, with a logarithmic gcd for each pair. The official limit is 500 points; this page draws up to 10.',
  examples: [
    { label: 'Two rails', input: '{"points":[[0,0],[2,0],[5,0],[1,3],[3,3]]}' },
    { label: 'Parallelogram', input: '{"points":[[0,0],[3,0],[4,2],[1,2]]}' },
    { label: 'Mixed', input: '{"points":[[0,0],[4,0],[1,2],[3,2],[6,1],[2,-2]]}' },
    { label: 'All on one line', input: '{"points":[[0,0],[1,1],[2,2],[3,3]]}' },
  ],
}

export default function CountNumberOfTrapezoidsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ParallelSegmentsView run={run} step={step} />} renderReasoning={() => <>
    <p>Checking every four points is far too slow, so count from the parallel sides instead. Two segments with the same direction on different lines always bound a convex trapezoid, so each such pair of segments is one shape.</p>
    <p>Segments on the same line cannot be paired: their four points would be collinear. That is why segments are grouped by line within each direction, and only pairs across different lines count.</p>
    <p>A parallelogram has two pairs of parallel sides, so it was counted twice and must lose one. Its diagonals are the only pairing that shares a midpoint with different directions, which gives exactly one subtraction per parallelogram.</p>
    <p>Directions are stored as reduced integer pairs and midpoints as coordinate sums, so no floating point rounding can split or merge a group.</p>
  </>} />
}
