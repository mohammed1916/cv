import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Rank', description: 'Convert n to a zero-based rank.' },
    { id: 'choose', label: 'Place bit', description: 'Choose the largest position that fits the remaining rank.' },
    { id: 'done', label: 'Complete', description: 'Report the n-th smallest integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rank and bit count (JSON object with n and k)',
  url: 'https://leetcode.com/problems/find-nth-smallest-integer-with-k-one-bits/',
  complexity: 'O(k * positions) time using binomial coefficients. The visualization caps n at 20 and k at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"k":2}' },
    { label: 'Example 2', input: '{"n":3,"k":1}' },
  ],
}

export default function FindNthSmallestWithKOneBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const width = Math.max(1, Math.ceil(Math.log2(step.value + 1)))
    const bits = Array.from({ length: width }, (_, i) => (step.value >> (width - 1 - i)) & 1)
    return <IndexedSequence label="Bits, high to low" length={bits.length} valueAt={i => bits[i]} active={-1}
      roleAt={i => (bits[i] ? 'set' : '')} indexOffset={0} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Numbers with k one bits are ordered by their set positions, so the rank selects the positions one at a time.</p>
  </>} />
}
