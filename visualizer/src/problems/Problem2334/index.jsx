import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2334',
  phases: [
    { id: 'bounds', label: 'Bounds', description: 'For each element, find the nearest smaller value on each side with a stack.' },
    { id: 'check', label: 'Check', description: 'The span where this element is the smallest gives a subarray length.' },
    { id: 'done', label: 'Result', description: 'Return a length whose window passes, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 3, 4, 3, 1], "threshold": 6}',
  url: 'https://leetcode.com/problems/subarray-with-elements-greater-than-varying-threshold/',
  complexity: 'O(n) time and O(n) space with the monotonic stack. Each element is pushed and popped once.',
  examples: [
    { label: 'Example', input: '{"nums":[1,3,4,3,1],"threshold":6}' },
    { label: 'Single peak', input: '{"nums":[6,5,6,5,8],"threshold":7}' },
    { label: 'None', input: '{"nums":[1,1,1],"threshold":9}' },
    { label: 'Single value', input: '{"nums":[5],"threshold":5}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4],"threshold":12}' },
    { label: 'Largest values, 12 entries', input: '{"nums":[20,20,20,20,20,20,20,20,20,20,20,20],"threshold":100}' },
    { label: 'Long run: 12 values', input: '{"nums":[3,20,19,2,19,16,8,19,17,14,16,2],"threshold":60}' },
  ],
}

export default function VaryingThreshold() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.i}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : step.r >= 0 && i === step.r ? 'r' : step.l >= 0 && i > step.l - 1 && i <= step.r ? 'window' : '')} />
      <output aria-label="Span">{step.l >= 0 ? `span ${step.l}..${step.r}, length ${step.r - step.l + 1}` : 'no span'}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A subarray of length k works when every element in it exceeds threshold / k. Take the smallest element of the subarray: its condition implies the others.</p>
    <p>For each element, its widest stretch where it stays the smallest is found with a stack. If element times that stretch length exceeds the threshold, the stretch length is the answer.</p>
  </>} />
}
