import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First window', description: 'Sum the first k values.' },
    { id: 'slide', label: 'Slide window', description: 'Add the entering value and remove the leaving one.' },
    { id: 'done', label: 'Complete', description: 'Return the best average.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  complexity: 'O(n) time and O(1) extra space; the window sum is updated in constant time per step.',
  examples: [
    { label: 'Classic', input: '{"nums":[1,12,-5,-6,50,3],"k":4}' },
    { label: 'Single', input: '{"nums":[5],"k":1}' },
    { label: 'Negatives', input: '{"nums":[-1,-2,-3],"k":2}' },
  ],
}

export default function MaxAverageSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Values (window of ${run.input.k})`} length={run.input.nums.length} active={step.end}
      valueAt={i => run.input.nums[i]} roleAt={i => (i >= step.start && i <= step.end ? 'in-window' : '')} />
    <output aria-label="Window sum">Window sum {step.sum} · best average {Number(step.best.toFixed(5))}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Constant update:</strong> each slide changes the sum by one entering and one leaving value, so the window never needs re-summing.</p>
    <p>Average = sum ÷ {run.input.k}.</p>
  </>} />
}
