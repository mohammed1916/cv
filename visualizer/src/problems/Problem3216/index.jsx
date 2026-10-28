import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Scan adjacent pairs from the left.' },
    { id: 'scan', label: 'Scan', description: 'This pair is in order or has mixed parity.' },
    { id: 'swap', label: 'Swap', description: 'This pair has equal parity and is out of order.' },
    { id: 'done', label: 'Complete', description: 'Report the resulting string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit string of 1 to 20 digits (JSON string)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-a-swap/',
  complexity: 'O(n) time and O(n) space for the output. The visualization caps input at 20 digits.',
  examples: [
    { label: 'Example 1', input: '"45320"' },
    { label: 'Example 2', input: '"001"' },
  ],
}

export default function SmallestAfterSwap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits" length={step.text.length} valueAt={i => step.text[i]}
      active={step.index} roleAt={i => (step.index >= 0 && (i === step.index || i === step.index + 1) ? 'pair' : '')} />
    <output aria-label="Current string">{`String: ${step.text}`}</output>
  </>} renderReasoning={() => <>
    <p>A swap is allowed only between two digits of the same parity, and it helps only when the left digit is larger.</p>
    <p>The leftmost such pair decides the result, because lowering an earlier digit outweighs any later change.</p>
  </>} />
}
