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
    { label: 'Two by two zeros', input: '[[0,0],[0,0]]' },
    { label: 'Equal diagonal values', input: '[[5,-5],[-5,5]]' },
    { label: 'Extreme cell values', input: '[[-100,100,-100,100,-100,100,-100,100],[100,-100,100,-100,100,-100,100,-100],[-100,100,-100,100,-100,100,-100,100],[100,-100,100,-100,100,-100,100,-100],[-100,100,-100,100,-100,100,-100,100],[100,-100,100,-100,100,-100,100,-100],[-100,100,-100,100,-100,100,-100,100],[100,-100,100,-100,100,-100,100,-100]]' },
    { label: 'Long run: 8 by 8', input: '[[-59,-54,52,8,-42,62,83,89],[-54,-76,-6,-43,-81,54,98,44],[10,9,-28,86,91,54,86,21],[35,-94,-86,-25,-69,-78,-25,79],[-2,-97,60,-41,5,-35,-11,-51],[44,-35,80,-49,-27,19,-71,97],[71,-96,22,40,-100,-5,69,-61],[53,2,58,41,63,87,59,39]]' },
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
