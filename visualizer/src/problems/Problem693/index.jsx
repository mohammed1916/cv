import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Binary form', description: 'Write the number in binary, most significant bit first.' },
    { id: 'pair', label: 'Compare neighbours', description: 'Each adjacent pair of bits must differ.' },
    { id: 'fail', label: 'Repeated bit', description: 'Two equal neighbours break the alternation.' },
    { id: 'done', label: 'Answer', description: 'True when every neighbouring pair differs.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Positive integer (JSON)',
  url: 'https://leetcode.com/problems/binary-number-with-alternating-bits/',
  complexity: 'O(b) time for b bits and O(b) space for the binary string.',
  examples: [
    { label: 'Alternating', input: '21' },
    { label: 'Repeated pair', input: '11' },
    { label: 'Single bit', input: '1' },
  ],
}

export default function AlternatingBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Bits of ${step.bits} (most significant first)`} length={step.bits.length} active={step.i ?? -1}
      valueAt={i => step.bits[i]}
      roleAt={i => (step.i !== null && i === step.i ? 'r' : step.i !== null && i === step.i - 1 ? 'l' : '')} />
    <output aria-label="Result">{step.result === null ? 'Checking' : step.result ? 'Alternating' : 'Not alternating'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why neighbours:</strong> an alternating number is one where each bit differs from the one beside it, so one adjacent comparison per bit is enough.</p>
  </>} />
}
