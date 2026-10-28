import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no x value chosen.' },
    { id: 'scan', label: 'Scan', description: 'Keep the largest y for each x value.' },
    { id: 'rank', label: 'Rank', description: 'Order the best entries by y.' },
    { id: 'pick', label: 'Pick', description: 'Add the top entries, one per distinct x.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum y-sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x and y arrays of equal length 3 to 30, for example {"x":[1,2,1,3,2],"y":[5,6,4,7,9]}',
  url: 'https://leetcode.com/problems/maximize-ysum-by-picking-a-triplet-of-distinct-xvalues/',
  complexity: 'O(n log n) time for the ranking. The visualization caps the arrays at 30 entries.',
  examples: [
    { label: 'Example 1', input: '{"x":[1,2,1,3,2],"y":[5,6,4,7,9]}' },
    { label: 'Example 2', input: '{"x":[1,1,2,3],"y":[10,2,30,20]}' },
  ],
}

export default function DistinctXTriplet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="y values" length={run.input.y.length} valueAt={index => `x${run.input.x[index]}: ${run.input.y[index]}`} active={step.index}
      roleAt={index => (step.picked.includes(index) ? 'picked' : '')} />
    <output aria-label="Y sum">{`Y sum so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two entries with the same x value cannot both be used, so only the largest y for each x is a candidate.</p>
    <p>Taking the three largest candidates gives the best sum, because all three automatically have distinct x values.</p>
  </>} />
}
