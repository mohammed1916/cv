import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SuffixReversalView from './SuffixReversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4071',
  phases: [
    { id: 'suffix', label: 'Tail costs', description: 'Precompute the dial cost inside each tail.' },
    { id: 'candidate', label: 'Reverse from k', description: 'Price reversing the suffix that starts at k.' },
    { id: 'keep', label: 'No reversal', description: 'Compare with dialing the string unchanged.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest choice.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Decimal digits (1 to 30), e.g. 2581 or "90210"',
  url: 'https://leetcode.com/problems/minimum-rotations-to-dial-a-number-ii/',
  complexity: 'O(n) time and O(n) space for n digits. The visualization caps the string at 30 digits; the official limit is 100000.',
  examples: [
    { label: 'Reverse the tail', input: '91' },
    { label: 'Mixed digits', input: '3072' },
    { label: "Single digit", input: "7" },
    { label: "Equal digits", input: "5555" },
    { label: "Largest input length", input: "011752422853277179405483145879" },
    { label: "Zeros inside", input: "100000000" },
  ],
}

export default function MinimumRotationsDialIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SuffixReversalView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Best total: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
