import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both counts start at zero.' },
    { id: 'bit', label: 'Bit', description: 'Check the bit at this position and count it by parity.' },
    { id: 'done', label: 'Complete', description: 'Report the even and odd counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": integer from 1 to 1000}',
  url: 'https://leetcode.com/problems/number-of-even-and-odd-bits/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":50}' },
    { label: 'Example 2', input: '{"n":2}' },
  ],
}

export default function EvenOddBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Bits of n, from position 0 upward" length={step.bits.length} valueAt={i => step.bits[i]} active={step.bit}
      roleAt={i => (step.bits[i] ? (i % 2 === 0 ? 'even position' : 'odd position') : '')} />
    <output aria-label="Counts">{`Even: ${step.even}, odd: ${step.odd}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each bit has a position, and only the parity of the position matters, so the count is a single pass over the bits.</p>
  </>} />
}
