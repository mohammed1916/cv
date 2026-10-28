import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Window sums', description: 'Sum every window of each length.' },
    { id: 'second', label: 'Second window', description: 'Pair each second window with the best earlier first window.' },
    { id: 'first', label: 'First window', description: 'Pair each first window with the best earlier second window.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, first_len, and second_len',
  url: 'https://leetcode.com/problems/maximum-sum-of-two-non-overlapping-subarrays/',
  complexity: 'O(n) time after the window sums, using running best values. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,6,5,2,2,5,1,9,4],"first_len":1,"second_len":2}' },
    { label: 'Example 2', input: '{"nums":[3,8,1,3,2,1,8,9,0],"first_len":3,"second_len":2}' },
  ],
}

export default function MaxTwoSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, first_len: firstLen, second_len: secondLen } = run.input
    const inSpan = i => step.span !== null && i >= step.span[0] && i <= step.span[1]
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.span ? step.span[0] : -1}
        roleAt={i => (inSpan(i) ? (step.phase === 'second' ? 'second window' : 'first window') : '')} />
      <output aria-label="Window status">{`Window lengths ${firstLen} and ${secondLen}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Either window can come first. Sweeping the second window while remembering the best first window that ends before it covers every pair where the first window is earlier.</p>
    <p>A mirrored sweep covers the case where the second window is earlier, so every non-overlapping pair is checked.</p>
  </>} />
}
