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
    { label: 'Single cell', input: '[[5]]' },
    { label: 'Equal values everywhere', input: '[[2,2],[2,2]]' },
    { label: 'Alternating maximum and zero', input: '[[1000,0,1000,0,1000,0,1000,0]]' },
    { label: 'Long run: 8x8 grid', input: '[[116,205,276,464,355,111,765,104],[123,911,267,489,942,184,410,964],[417,792,299,405,174,923,598,511],[482,913,260,788,179,164,420,929],[298,110,876,639,505,116,117,784],[286,892,698,724,906,122,962,159],[156,276,920,7,53,775,699,393],[171,530,528,56,487,526,986,542]]' },
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
