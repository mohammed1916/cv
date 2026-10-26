import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'One A', description: 'Begin with a single character.' },
    { id: 'factor', label: 'Factor', description: 'Each prime factor p costs p operations.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Target count n (JSON)',
  url: 'https://leetcode.com/problems/2-keys-keyboard/',
  complexity: 'O(√n) trial division time and O(log n) space for the factor list.',
  examples: [
    { label: 'Three', input: '3' },
    { label: 'Twelve', input: '12' },
    { label: 'One', input: '1' },
  ],
}

export default function TwoKeysKeyboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Characters on screen">{'A'.repeat(Math.min(step.value, 120))}{step.value > 120 ? '…' : ''}</output>
    <p>Count {step.value} of {step.n} · operations so far {step.ops}{step.factor ? ` · factor ${step.factor}` : ''}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why prime factors:</strong> any copy-and-paste run that multiplies the count by p costs p operations. Composite multipliers are never cheaper than their prime factors.</p>
  </>} />
}
