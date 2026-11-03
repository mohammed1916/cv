import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PathPairView from './PathPairView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3938',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of rows (2 to 8 rows and columns, values -100 to 100)',
  url: 'https://leetcode.com/problems/maximum-path-intersection-sum-in-a-grid/',
  complexity: 'Column-by-column DP over pairs of entry rows: O(rows^4 * cols) time in this direct form. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Three by four', input: '[[1,-2,3,0],[4,5,-6,2],[-1,7,8,1]]' },
    { label: 'Two by three', input: '[[-1,4,2],[3,-5,6]]' },
  ],
}

export default function Problem3938Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PathPairView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
