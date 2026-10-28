import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'encode', label: 'Encode', description: 'Write the next letter as its 8-bit ASCII code.' },
    { id: 'done', label: 'Complete', description: 'Compare the bit string with its reverse.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/check-ascii-palindromic/',
  complexity: 'O(n) time and O(n) space for n letters. The visualization caps s at 16 letters.',
  examples: [
    { label: 'True', input: '{"s":"ff"}' },
    { label: 'False', input: '{"s":"leet"}' },
  ],
}

export default function CheckAsciiPalindromic() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} />
    <output aria-label="Bits">{step.bits || '(no bits yet)'}</output>
  </>} renderReasoning={() => <>
    <p>Every letter becomes exactly eight bits, so the joined string is just the bits in order.</p>
    <p>The check is the same as comparing the bit string with its reverse.</p>
  </>} />
}
