import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Binary', description: 'Write n in binary.' },
    { id: 'pair', label: 'Compare pair', description: 'Check each adjacent pair of bits.' },
    { id: 'done', label: 'Complete', description: 'Report whether all pairs differ.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Positive integer n (JSON)',
  url: 'https://leetcode.com/problems/binary-number-with-alternating-bits/',
  complexity: 'O(log n) time for the bit scan, or O(1) with the XOR trick.',
  examples: [
    { label: 'Alternating', input: '5' },
    { label: 'Equal neighbours', input: '7' },
    { label: 'Single bit', input: '11' },
  ],
}

export default function AlternatingBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Bits of ${step.bits} (most significant first)`} length={step.bits.length} active={step.index}
      valueAt={i => step.bits[i]} roleAt={i => (i === step.index ? (step.ok ? 'written' : 'shifted') : '')} />
    <output aria-label="Alternating">{step.phase === 'done' ? `Alternating: ${String(step.result)}` : 'Checking…'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Shortcut:</strong> n XOR (n &gt;&gt; 1) is all ones exactly when every adjacent pair differs.</p>
  </>} />
}
