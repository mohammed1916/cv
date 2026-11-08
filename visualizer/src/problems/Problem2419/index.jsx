import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2419',
  phases: [
    { id: 'setup', label: 'Top value', description: 'The largest AND of a subarray is the largest value itself.' },
    { id: 'extend', label: 'Run', description: 'A value equal to the top extends the run.' },
    { id: 'break', label: 'Break', description: 'A smaller value ends the run.' },
    { id: 'done', label: 'Result', description: 'Return the longest run of the top value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 2, 3, 3, 2, 2]}',
  url: 'https://leetcode.com/problems/longest-subarray-with-maximum-bitwise-and/',
  complexity: 'O(n) time and O(1) extra space after finding the maximum.',
  examples: [
    { label: 'Own: five values', input: '{"nums":[6,1,4,4,2]}' },
    { label: 'Ties', input: '{"nums":[5,5,5]}' },
    { label: 'Single value', input: '{"nums":[3]}' },
    { label: 'Alternating values', input: '{"nums":[7,1,7,1,7,1,7]}' },
    { label: 'Twelve values, all seven values', input: '{"nums":[1,2,3,4,5,6,7,7,6,5,4,3]}' },
    { label: 'Long run: 12 values', input: '{"nums":[2,5,4,2,7,4,2,2,6,2,6,6]}' },
  ],
}

export default function LongestMaxAndSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="values" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="Longest">{`longest run of the top value ${step.best}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A subarray's AND is never larger than its smallest element, and a single element achieves its own value. So the largest possible AND is the largest value in the array.</p>
    <p>A subarray reaches that AND only when every element equals the largest value, so the answer is the longest run of that value.</p>
  </>} />
}
