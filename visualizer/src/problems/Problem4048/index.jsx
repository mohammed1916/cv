import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpacingView from './SpacingView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no recorded positions.' },
    { id: 'collect', label: 'Collect', description: 'Record the index of each value.' },
    { id: 'count', label: 'Ready', description: 'Every value has its positions.' },
    { id: 'check', label: 'Check', description: 'Test one value for exactly three equal gaps.' },
    { id: 'add', label: 'Count', description: 'Add a value that passes.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of values (e.g. [1,2,1,1])',
  url: 'https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-i/',
  complexity: 'O(n) time and O(n) space for n values. The visualization caps the array at 20 values; the official limit is 100.',
  examples: [
    { label: 'Two matches', input: '[3,1,3,2,3,1,1,4,4,4]' },
    { label: 'Four occurrences', input: '[4,7,4,9,4,7,7,7,1]' },
  ],
}

export default function CountValuesEquallySpacedI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SpacingView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
