import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Record where each digit last appears.' },
    { id: 'scan', label: 'Scan', description: 'Look for a larger digit later in the number.' },
    { id: 'swap', label: 'Swap', description: 'Exchange the first digit with the largest later digit.' },
    { id: 'done', label: 'Complete', description: 'Return the maximum number.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Non-negative integer num (JSON)',
  url: 'https://leetcode.com/problems/maximum-swap/',
  complexity: 'O(d) time for d digits, with a 10-slot table of last positions.',
  examples: [
    { label: 'Swap 2 and 7', input: '2736' },
    { label: 'Swap 9 and 7', input: '9973' },
    { label: 'Already max', input: '98368' },
  ],
}

export default function MaximumSwap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits" length={step.digits.length} active={step.swap ? step.swap[0] : step.index ?? -1}
      valueAt={i => step.digits[i]} roleAt={i => (step.swap && (i === step.swap[0] || i === step.swap[1]) ? 'swapped' : '')} />
    <output aria-label="Current number">{step.digits.join('')}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one swap:</strong> the leftmost digit that can be increased should get the largest digit available to its right, and the rightmost copy of that digit moves the least.</p>
  </>} />
}
