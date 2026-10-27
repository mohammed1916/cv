import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort the numbers so strong partners sit in a window.' },
    { id: 'window', label: 'Window', description: 'Advance the left edge until every value in the window is a strong partner.' },
    { id: 'pair', label: 'Pair', description: 'Compare each pair in the window by XOR.' },
    { id: 'done', label: 'Complete', description: 'Report the best XOR found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers from 1 to 100 (JSON object with nums)',
  url: 'https://leetcode.com/problems/maximum-strong-pair-xor-i/',
  complexity: 'O(n^2) time in the worst case and O(n) space. The visualization caps the list at 12 numbers.',
  examples: [
    { label: 'Example', input: '{"nums":[1,2,3,4,5]}' },
    { label: 'Far apart', input: '{"nums":[1,100]}' },
  ],
}

export default function MaximumStrongPairXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roleAt = index => {
      if (step.pairing === index) return 'pair'
      if (step.left <= index && index <= step.right) return 'window'
      return ''
    }
    return <>
      <IndexedSequence label="Sorted numbers" length={step.values.length} valueAt={index => step.values[index]}
        active={step.right} roleAt={roleAt} />
      <output aria-label="Best XOR">{`Best strong-pair XOR so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A pair (x, y) with x at most y is strong exactly when y is at most twice x. After sorting, the partners of each value form a contiguous window.</p>
    <p>The window's left edge only moves forward as the right edge advances, so the scan stays linear in the window moves.</p>
  </>} />
}
