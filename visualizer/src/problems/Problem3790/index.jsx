import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the empty number, remainder 0.' },
    { id: 'step', label: 'Append a one', description: 'Append a digit 1 and record the remainder.' },
    { id: 'found', label: 'Found', description: 'The number of ones is divisible by k.' },
    { id: 'none', label: 'No answer', description: 'No all-ones number is divisible by k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Divisor (JSON object with k)',
  url: 'https://leetcode.com/problems/smallest-all-ones-multiple/',
  complexity: 'O(k) time and O(1) extra space. The visualization caps k at 60.',
  examples: [
    { label: 'k = 3', input: '{"k":3}' },
    { label: 'k = 7', input: '{"k":7}' },
    { label: 'k = 2', input: '{"k":2}' },
  ],
}

export default function SmallestAllOnesMultiple() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Remainders by length" length={step.remainders.length} valueAt={i => step.remainders[i]}
      active={step.remainders.length - 1} roleAt={i => (i === step.remainders.length - 1 && step.remainder === 0 ? 'divisible' : '')} />
  )} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>For k = {run.input.k}, the remainder of each all-ones number follows from the one before it: remainder times 10 plus 1, modulo k.</p>
  </>} />
}
