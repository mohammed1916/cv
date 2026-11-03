import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ProgressionGapView from './ProgressionGapView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1228',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of the remaining terms (e.g. [5,7,11,13])',
  url: 'https://leetcode.com/problems/missing-number-in-arithmetic-progression/description/',
  complexity: 'O(log n) time and O(1) extra space after reading the endpoints. The visualization caps the array at 20 values; the draft does not state an exact official bound.',
  examples: [
    { label: 'Gap after 7', input: '[5,7,11,13]' },
    { label: 'Decreasing', input: '[15,13,11,7]' },
    { label: 'Constant', input: '[4,4,4]' },
  ],
}

export default function Problem1228MissingNumberInProgression() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ProgressionGapView run={run} step={step} />}
      renderReasoning={() => (
        <p>The endpoints fix the common difference. Before the removed term every value sits on the progression; after it, every value is off by one step. That turns the search into a binary search for the first mismatch.</p>
      )}
    />
  )
}
