import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No markers yet.' },
    { id: 'bad', label: 'Too big', description: 'A value above the right bound resets the window.' },
    { id: 'good', label: 'In range', description: 'A value in range is a valid end for subarrays.' },
    { id: 'small', label: 'Too small', description: 'A small value extends the last good window.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums, left and right (JSON object)',
  url: 'https://leetcode.com/problems/number-of-subarrays-with-bounded-maximum/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Window', input: '{"nums":[2,5,1,3,6],"left":2,"right":4}' },
    { label: 'Narrow', input: '{"nums":[3,1,2,9,2],"left":2,"right":3}' },
  ],
}

export default function BoundedMaximum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`nums (window of valid ends: after bad marker ${step.lastBad}, good marker ${step.lastGood})`} length={run.input.nums.length} active={step.i}
      valueAt={i => run.input.nums[i]}
      roleAt={i => (i === step.lastBad ? 'bad' : i === step.lastGood ? 'good' : i === step.i ? 'r' : i > step.lastBad && i < step.i ? 'window' : '')} />
    <output aria-label="Total">{`Subarrays counted so far: ${step.count} (+${step.added} at this end)`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A subarray ending at position i has a maximum in range exactly when it contains no value above the bound and at least one value inside the range.</p>
    <p>The count of valid starts for a subarray ending at i is lastGood minus lastBad, which the scan updates in one pass.</p>
  </>} />
}
