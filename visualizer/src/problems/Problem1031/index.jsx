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
    { label: 'Example 3', input: '{"nums":[5,1,9,2,7,3],"first_len":2,"second_len":2}' },
    { label: 'Two numbers, one window each', input: '{"nums":[5,3],"first_len":1,"second_len":1}' },
    { label: 'Equal values keep the first pair', input: '{"nums":[4,4,4,4],"first_len":1,"second_len":1}' },
    { label: 'Largest input: 12 numbers, windows of 6', input: '{"nums":[100,100,100,100,100,100,100,100,100,100,100,100],"first_len":6,"second_len":6}' },
    { label: 'All zeros give zero', input: '{"nums":[0,0,0,0,0],"first_len":2,"second_len":3}' },
    { label: 'Long run: 12 items', input: '{"nums":[65,48,67,36,66,69,94,18,83,24,85,22],"first_len":3,"second_len":4}' },
  ],
}

const sums = (nums, length) => Array.from({ length: nums.length - length + 1 }, (_, s) => nums.slice(s, s + length).reduce((a, b) => a + b, 0))

export default function MaxTwoSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, first_len: firstLen, second_len: secondLen } = run.input
    const len = step.phase === 'second' ? secondLen : firstLen
    const span = step.span
    const roleAt = i => {
      if (!span) return ''
      if (i === span[0]) return 'l'
      if (i === span[1]) return 'r'
      return i > span[0] && i < span[1] ? 'window' : ''
    }
    const windowSum = sums(nums, len)
    const roleSum = s => (step.index === s ? 'current' : '')
    return <>
      <IndexedSequence label="nums with the window being tested" length={nums.length} valueAt={i => nums[i]} active={span ? span[0] : -1} roleAt={roleAt} />
      <IndexedSequence label={`Sums of windows of length ${len}`} length={windowSum.length} valueAt={i => windowSum[i]} active={step.index} roleAt={roleSum} />
      <output aria-label="Window status">{`Window lengths ${firstLen} and ${secondLen}. Best total so far: ${step.best ?? 'none'}. ${step.message}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Either window can come first. Sweeping the second window while remembering the best first window that ends before it covers every pair where the first window is earlier.</p>
    <p>A mirrored sweep covers the case where the second window is earlier, so every non-overlapping pair is checked.</p>
  </>} />
}
