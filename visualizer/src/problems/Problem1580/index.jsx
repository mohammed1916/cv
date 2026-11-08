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
  complexity: 'O(n log n) time for sorting and O(n) space for n rooms and m boxes. The visualization caps both at 10 and heights at 1 to 9. Unlike Problem 1564, a room is reachable from either end.',
  examples: [
    { label: 'Two ends', input: '{"boxes":[2,6,3,4],"warehouse":[5,4,6,1]}' },
    { label: 'Mixed ceilings', input: '{"boxes":[1,2,5,6],"warehouse":[6,2,3,7]}' },
    { label: 'None fit', input: '{"boxes":[5],"warehouse":[1]}' },
    { label: "Single box fits", input: "{\"boxes\":[3],\"warehouse\":[4]}" },
    { label: "Equal heights and ceilings", input: "{\"boxes\":[4,4,4],\"warehouse\":[4,4,4]}" },
    { label: "Largest values, ten rooms", input: "{\"boxes\":[9,9,9,9,9,9,9,9,9,9],\"warehouse\":[9,9,9,9,9,9,9,9,9,9]}" },
    { label: "Nothing fits, low ceilings", input: "{\"boxes\":[9,8,7],\"warehouse\":[1,2]}" },
    { label: "Long run: 10 boxes and 10 rooms", input: "{\"boxes\":[6,8,5,8,4,1,7,8,5,4],\"warehouse\":[6,6,2,9,4,8,9,5,1,9]}" },
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
