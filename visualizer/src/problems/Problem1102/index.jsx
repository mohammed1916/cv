import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ScoreFloodView from './ScoreFloodView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1102',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Grid of integers, rows as lists (e.g. [[5,4,5],[1,2,6],[7,4,6]])',
  url: 'https://leetcode.com/problems/path-with-maximum-minimum-value/',
  complexity: 'O(R·C·log(R·C)) time with a priority queue, and O(R·C) space for an R x C grid. The visualization caps the grid at 8 x 8 with values from 0 to 1000; the official bounds were not verified.',
  examples: [
    { label: 'Example grid', input: '[[4,8,3],[6,1,7],[9,2,5]]' },
    { label: 'Second grid', input: '[[3,1,2,6],[5,4,1,3],[2,6,4,5]]' },
  ],
}

export default function PathWithMaximumMinimumValue() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ScoreFloodView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Every neighbour is scored by the smaller of the path so far and its own value, and it is only kept when that beats its best.
          {run ? ` The bottom-right best score is ${run.answer}.` : ''} {step.improved === false ? 'This neighbour already has a better path.' : ''}
        </p>
      )}
    />
  )
}
