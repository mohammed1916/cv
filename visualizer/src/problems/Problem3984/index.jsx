import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DivisibleGameView from './DivisibleGameView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Setup', description: 'Prepare the best score and divisor.' },
  { id: 'k', label: 'Choose k', description: 'Score every element for this divisor.' },
  { id: 'weigh', label: 'Weigh', description: 'Extend the best interval by one element.' },
  { id: 'keep', label: 'Keep', description: 'This k beats the best so far.' },
  { id: 'skip', label: 'Skip', description: 'This k does not beat the best.' },
  { id: 'done', label: 'Answer', description: 'Scale the best score by k.' },
]

const definition = {
  number: '3984',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of values (for example [6, 4, 9])',
  url: 'https://leetcode.com/problems/divisible-game/',
  complexity: 'O(K * n) time for K candidate divisors and n values, using a running best interval per divisor. The visualization caps the array at 30 values from 1 to 30; the official limits are larger and this route is not sized for them.',
  examples: [
    { label: 'Mixed', input: '[6, 4, 9, 10]' },
    { label: 'Single', input: '[7]' },
    { label: 'Repeated', input: '[3, 3, 3, 3]' },
    { label: "Smallest value", input: '[1]' },
    { label: "Equal values", input: '[5,5,5,5,5]' },
    { label: "Maximum length and value", input: '[30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]' },
    { label: "Long run: 30 values", input: '[24,20,21,5,18,16,18,18,7,14,14,1,13,28,20,14,27,27,29,18,25,26,19,29,22,14,22,20,28,16]' },
  ],
}

export default function DivisibleGame() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DivisibleGameView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result ${run.result} after scaling the best score by k.` : ''}
        </p>
      )}
    />
  )
}
