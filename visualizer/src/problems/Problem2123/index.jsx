import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatchGridView from './MatchGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2123',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary grid as JSON rows (e.g. [[1,1],[1,1]])',
  url: 'https://leetcode.com/problems/minimum-operations-to-remove-adjacent-ones-in-matrix/',
  complexity: 'O(V * E) time for the augmenting-path matching, where V is the number of ones and E the adjacent pairs; O(V + E) space. The visualization caps the grid at 6 x 6; the draft does not verify the official size bound.',
  examples: [
    { label: 'Full 3 x 3', input: '[[1,1,1],[1,1,1],[1,1,1]]' },
    { label: 'Diagonal only', input: '[[1,0],[0,1]]' },
    { label: 'Square', input: '[[1,1],[1,1]]' },
  ],
}

export default function Problem2123Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MatchGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
