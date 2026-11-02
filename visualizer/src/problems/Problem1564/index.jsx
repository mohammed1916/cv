import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WarehouseBarsView from './WarehouseBarsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1564',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with boxes (heights) and warehouse (room ceilings, entered from the left)',
  url: 'https://leetcode.com/problems/put-boxes-into-the-warehouse-i/description/',
  complexity: 'O(n log n) time for sorting, O(n) space for n rooms and m boxes (the visualization caps both at 10 and heights at 1 to 9). The draft does not verify the official bounds.',
  examples: [
    { label: 'Three boxes', input: '{"boxes":[4,3,4,1],"warehouse":[5,3,4,1,2]}' },
    { label: 'Tall room hidden', input: '{"boxes":[1,2,2,3,4],"warehouse":[3,4,1,2]}' },
    { label: 'None fit', input: '{"boxes":[5],"warehouse":[1]}' },
  ],
}

export default function Problem1564Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WarehouseBarsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
