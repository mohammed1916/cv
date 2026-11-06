import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1991',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/find-the-middle-index-in-array/',
  complexity: 'O(n) time and O(1) extra space: one total and one running left sum.',
  examples: [
    { label: 'Middle found', input: '[6,1,2,3,0,4,3]' },
    { label: 'Zero balance', input: '[0,0,0]' },
    { label: 'No balance', input: '[1,2,3]' },
  ],
}

export default function FindMiddleIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, total, index, left, right, answer } = step.snapshot
    return <>
      <IndexedSequence
        label="Values; the sum left of the current index is shaded"
        length={nums.length}
        active={index >= 0 ? index : -1}
        valueAt={i => nums[i]}
        roleAt={i => (index < 0 ? '' : i < index ? 'left' : i > index ? 'right' : '')}
      />
      <p>Total <strong>{total}</strong>. At index <strong>{index >= 0 ? index : '-'}</strong>: left sum <strong>{left}</strong>, right sum <strong>{right ?? '-'}</strong>.</p>
      {answer >= 0 && <p>Answer found: <strong>{answer}</strong>.</p>}
    </>
  }} renderReasoning={() => <p>The right sum is never summed again: it equals the total minus the left sum minus the current value, so each index is checked in constant time.</p>} />
}
