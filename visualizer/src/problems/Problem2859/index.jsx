import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of zero.' },
    { id: 'add', label: 'Add', description: 'This index has k set bits, so its value joins the total.' },
    { id: 'skip', label: 'Skip', description: 'This index has a different number of set bits.' },
    { id: 'done', label: 'Complete', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k, for example {"nums":[5,10,1,5,2],"k":1}',
  url: 'https://leetcode.com/problems/sum-of-values-at-indices-with-k-set-bits/',
  complexity: 'O(n log n) time for counting bits, and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,10,1,5,2],"k":1}' },
    { label: 'Example 2', input: '{"nums":[4,3,2,1],"k":2}' },
  ],
}

export default function SetBitIndexSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values by index" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} roleAt={i => (i === step.index ? (step.phase === 'add' ? 'added' : 'skipped') : '')} />
    <output aria-label="Total">{`Total: ${step.total}${step.bits !== null ? ` · index ${step.index} has ${step.bits} set bits` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>The index is the position in the array, and its set-bit count is the number of 1 digits in its binary form.</p>
    <p>Each index is checked once, so the whole array is scanned in one pass.</p>
  </>} />
}
