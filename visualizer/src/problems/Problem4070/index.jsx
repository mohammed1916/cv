import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DialView from './DialView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4070',
  phases: [
    { id: 'start', label: 'Start', description: 'The pointer rests on zero.' },
    { id: 'dial', label: 'Turn', description: 'Turn to the next digit the short way round.' },
    { id: 'done', label: 'Result', description: 'Report the total steps.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Exactly ten decimal digits, e.g. 4321098765 or "0123456789"',
  url: 'https://leetcode.com/problems/minimum-rotations-to-dial-a-number-i/',
  complexity: 'O(n) time and O(1) extra space for the ten-digit string.',
  examples: [
    { label: 'Descending', input: '9876543210' },
    { label: 'Repeats', input: '5511225599' },
    { label: "All zeros", input: "0000000000" },
    { label: "Ascending digits", input: "0123456789" },
    { label: "Repeated digit", input: "7777777777" },
    { label: "Long run: mixed digits", input: "3141592653" },
  ],
}

export default function MinimumRotationsDialIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DialView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Total steps: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
