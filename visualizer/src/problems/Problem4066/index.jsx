import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AdjacentTallyView from './AdjacentTallyView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4066',
  phases: [
    { id: 'setup', label: 'Start', description: 'No equal pairs and an empty tally.' },
    { id: 'equal', label: 'Equal pair', description: 'Two neighbours already match.' },
    { id: 'distinct', label: 'Tally pair', description: 'Two neighbours differ; count the unordered pair.' },
    { id: 'best', label: 'Best tally', description: 'Pick the most frequent distinct pair.' },
    { id: 'done', label: 'Result', description: 'Add the best tally to the equal pairs.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of positive integers, e.g. [1, 2, 1, 2]',
  url: 'https://leetcode.com/problems/maximum-equal-adjacent-pairs-after-at-most-one-replacement/',
  complexity: 'O(n) expected time with a hash tally of adjacent pairs, and O(n) space. The visualization caps the array at 20 values.',
  examples: [
    { label: 'Merge two values', input: '[1, 2, 1, 2]' },
    { label: 'Existing equal pairs', input: '[1, 1, 2, 2, 1, 1]' },
    { label: "Two values", input: "[1,2]" },
    { label: "Two equal values", input: "[5,5]" },
    { label: "Largest values", input: "[1000000000,1,1000000000,1]" },
    { label: "Long run: 20 values", input: "[1,3,1,2,3,2,4,2,4,1,1,3,2,3,3,3,2,1,4,1]" },
  ],
}

export default function MaximumEqualAdjacentPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <AdjacentTallyView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Maximum equal adjacent pairs: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
