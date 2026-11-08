import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitFlipView from './DigitFlipView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1056',
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the rotation table.' },
    { id: 'digit', label: 'Digit', description: 'Read the last digit.' },
    { id: 'rotate', label: 'Rotate', description: 'Place the rotated digit in front.' },
    { id: 'reject', label: 'Reject', description: 'This digit has no rotation.' },
    { id: 'compare', label: 'Compare', description: 'Compare the rotated value with the number.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A nonnegative integer (e.g. 89)',
  url: 'https://leetcode.com/problems/confusing-number/description/',
  complexity: 'O(d) time and O(1) extra space for d decimal digits. The visualization caps the input at 9 digits; the official numeric bound is not verified.',
  examples: [
    { label: 'Confusing', input: '89' },
    { label: 'Rotates to itself', input: '1001' },
    { label: 'Bad digit', input: '2' },
    { label: 'Zero', input: '0' },
    { label: 'Single rotating digit', input: '6' },
    { label: 'Largest input: nine digits', input: '888888888' },
    { label: 'Long run: nine digits', input: '861013238' },
  ],
}

export default function ConfusingNumber() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigitFlipView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Rotating turns the last digit into the first, so the rotated number is built from right to left.</p>}
    />
  )
}
