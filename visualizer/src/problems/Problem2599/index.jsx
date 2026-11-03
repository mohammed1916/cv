import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixLanesView from './PrefixLanesView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2599',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty heap and sum 0.' },
    { id: 'push', label: 'Read', description: 'Read the next value into the heap and sum.' },
    { id: 'move', label: 'Move', description: 'Move the smallest kept value to the end.' },
    { id: 'done', label: 'Result', description: 'Report the number of moves.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (integers from -9 to 9, total nonnegative)',
  url: 'https://leetcode.com/problems/make-the-prefix-sum-non-negative/',
  complexity: 'O(n log n) time and O(n) space for n values, using a min-heap of the values read so far. Each value is pushed once and popped at most once. The visualization caps nums at 10 values from -9 to 9; the official limits are larger.',
  examples: [
    { label: 'Early dip', input: '{"nums":[-3,2,-1,4,-2]}' },
    { label: 'Two dips', input: '{"nums":[-4,-2,5,-1,3]}' },
    { label: 'Already fine', input: '{"nums":[1,2,3]}' },
  ],
}

export default function MakeThePrefixSumNonNegative() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixLanesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} The heap always holds the values that are still available, so the most negative available value is the cheapest one to move away.</p>}
    />
  )
}
