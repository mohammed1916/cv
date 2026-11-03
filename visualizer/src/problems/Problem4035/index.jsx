import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SplitView from './SplitView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best score to zero.' },
    { id: 'choice', label: 'Choice', description: 'Pick what to remove, or nothing.' },
    { id: 'split', label: 'Split', description: 'Compare the two gcd values at one split.' },
    { id: 'add', label: 'Count', description: 'The two gcd values match.' },
    { id: 'record', label: 'Record', description: 'Keep the better choice.' },
    { id: 'done', label: 'Result', description: 'Return the best score.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of values (e.g. [2,4,8,3,6])',
  url: 'https://leetcode.com/problems/maximum-valid-split-positions-i/',
  complexity: 'O(n^3) time in this direct form: n + 1 choices, n splits, and a gcd over each side. The visualization caps the array at 12 values; the official limit is 1000.',
  examples: [
    { label: 'Removal helps', input: '[2,4,8,3,6]' },
    { label: 'Shared factor', input: '[12,6,9,3,15,6]' },
  ],
}

export default function MaximumValidSplitPositionsI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
