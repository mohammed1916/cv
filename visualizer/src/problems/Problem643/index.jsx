import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First window', description: 'Sum the first k values.' },
    { id: 'slide', label: 'Slide window', description: 'Add the entering value, remove the leaving value.' },
    { id: 'done', label: 'Answer', description: 'Divide the best window sum by k.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[4,-2,7,1,3,-5],"k":3}' },
    { label: 'Whole array', input: '{"nums":[2,6,4],"k":3}' },
    { label: 'Single value', input: '{"nums":[-7,-1,-3],"k":1}' },
  ],
}

export default function MaxAverageSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Values (window of ${run.input.k})`} length={run.input.nums.length} active={-1}
      valueAt={i => run.input.nums[i]}
      roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i >= step.l && i <= step.r ? 'in window' : '')} />
    <output aria-label="Window sum">Window sum {step.sum} · best {step.best} from index {step.bestStart}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why slide:</strong> neighbouring windows share k − 1 values, so one addition and one subtraction give the next sum.</p>
  </>} />
}
