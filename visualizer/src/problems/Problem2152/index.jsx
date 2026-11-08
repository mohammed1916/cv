import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoverLinesView from './CoverLinesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2152',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Points as JSON pairs (e.g. [[0,0],[1,1],[2,2],[0,3]])',
  url: 'https://leetcode.com/problems/minimum-number-of-lines-to-cover-points/',
  complexity: 'O(n^3 + 2^n * n) time and O(2^n) memo space: n pair lines are tested against every point, then covered sets are memoised. The visualization caps the input at 6 distinct points with coordinates from -100 to 100 so the subsets stay drawable.',
  examples: [
    { label: 'Three on a line plus one', input: '[[0,0],[1,1],[2,2],[0,3]]' },
    { label: 'Unit square', input: '[[0,0],[1,0],[0,1],[1,1]]' },
    { label: 'One line', input: '[[0,0],[1,1],[2,2],[3,3]]' },
    { label: 'Single point', input: '[[0,0]]' },
    { label: 'Two points', input: '[[0,0],[5,7]]' },
    { label: 'Largest coordinates', input: '[[-100,-100],[100,100],[-100,100],[100,-100],[0,0],[100,0]]' },
    { label: 'Long run: six points', input: '[[-82,11],[-99,-98],[-22,35],[97,1],[14,-22],[76,16]]' },
  ],
}

export default function Problem2152Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CoverLinesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
