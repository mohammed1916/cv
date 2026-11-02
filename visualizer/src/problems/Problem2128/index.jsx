import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FlipRowsView from './FlipRowsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2128',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary grid as JSON rows (e.g. [[1,0],[0,1]])',
  url: 'https://leetcode.com/problems/remove-all-ones-with-row-and-column-flips/',
  complexity: 'O(m * n) time and O(n) extra space for m rows of length n. The visualization caps the grid at 6 x 6; the draft does not verify the official size bound.',
  examples: [
    { label: 'Complementary rows', input: '[[1,0],[0,1]]' },
    { label: 'Mismatched rows', input: '[[1,0,1],[1,1,0]]' },
    { label: 'All ones', input: '[[1,1],[1,1]]' },
  ],
}

export default function Problem2128Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FlipRowsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
