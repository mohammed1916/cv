import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Binary', description: 'Write n in binary without leading zeros.' },
    { id: 'match', label: 'Agree', description: 'This mirrored pair already matches.' },
    { id: 'mismatch', label: 'Mismatch', description: 'Both bits in this mirrored pair must flip.' },
    { id: 'done', label: 'Result', description: 'Report the total flips.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive whole number n (1 to 1023 for this visualization)',
  url: 'https://leetcode.com/problems/minimum-number-of-flips-to-reverse-binary-string/',
  complexity: 'O(log n) time and O(log n) space for the binary string.',
  examples: [
    { label: 'Palindrome', input: '7' },
    { label: 'Alternating', input: '10' },
  ],
}

export default function MinimumNumberOfFlipsToReverseBinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="binary" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i}
      roleAt={i => (i === step.i || i === step.j ? 'window' : '')} />
    <output aria-label="Flip count">{`flips so far: ${step.flips}`}</output>
  </>} renderReasoning={() => <>
    <p>After the reversal, position i must hold the bit that now sits at its mirror. A bit that already agrees with its mirror costs nothing.</p>
    <p>When a mirrored pair disagrees, both of its bits must change, so each such pair adds two flips. The middle bit of an odd-length string always matches itself.</p>
  </>} />
}
