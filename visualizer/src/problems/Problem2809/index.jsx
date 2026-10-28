import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the indexes by growth.' },
    { id: 'item', label: 'Index', description: 'Consider one index as a zeroing operation.' },
    { id: 'check', label: 'Check time', description: 'Test whether the sum fits at this time.' },
    { id: 'done', label: 'Complete', description: 'Report the first time that fits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"nums1": [...], "nums2": [...], "x": integer}',
  url: 'https://leetcode.com/problems/minimum-time-to-make-array-sum-at-most-x/',
  complexity: 'O(n^2) time for the reduction table. The visualization caps input at 8 indexes.',
  examples: [
    { label: 'Example 1', input: '{"nums1": [1, 2, 3], "nums2": [1, 2, 3], "x": 4}' },
    { label: 'Impossible', input: '{"nums1": [1, 2, 3], "nums2": [3, 3, 3], "x": 4}' },
  ],
}

export default function MinimumTimeArraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Growth per second (nums2)" length={run.input.nums2.length} valueAt={i => run.input.nums2[i]} active={step.index} />
    <DPTable title="Best reduction with t zeroings" values={[step.best]} columnLabels={step.best.map((_, t) => t)}
      activeCell={step.time >= 0 ? { row: 0, column: step.time } : null} />
    <output aria-label="Sum">{step.phase === 'done' ? `Answer: ${step.total}` : `Time ${step.time >= 0 ? step.time : '-'}, sum ${step.total}, limit ${run.input.x}`}</output>
  </>} renderReasoning={() => <>
    <p>Zeroing an index at second s leaves it with (T minus s) times its growth at time T, so later zeroings remove more.</p>
    <p>Indexes that grow slowly are zeroed last, so the table adds them in increasing order of growth.</p>
  </>} />
}
