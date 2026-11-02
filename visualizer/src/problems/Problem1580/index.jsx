import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TwoEndsView from './TwoEndsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1580',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with boxes (heights) and warehouse (room ceilings; boxes may enter from either end)',
  url: 'https://leetcode.com/problems/put-boxes-into-the-warehouse-ii/description/',
  complexity: 'O(n log n) time for sorting and O(n) space for n rooms and m boxes. The visualization caps both at 10 and heights at 1 to 9; the draft does not verify the official bounds. Unlike Problem 1564, a room is reachable from either end.',
  examples: [
    { label: 'Two ends', input: '{"boxes":[4,3,4,1],"warehouse":[5,3,4,1,2]}' },
    { label: 'Mixed ceilings', input: '{"boxes":[1,2,3,4,5,6],"warehouse":[3,4,1,2,2,1]}' },
    { label: 'None fit', input: '{"boxes":[5],"warehouse":[1]}' },
  ],
}

export default function Problem1580Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TwoEndsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
