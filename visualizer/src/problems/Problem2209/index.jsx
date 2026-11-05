import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FloorView from './FloorView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2209',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with floor, numCarpets and carpetLen, e.g. {"floor":"10110101","numCarpets":2,"carpetLen":2}',
  url: 'https://leetcode.com/problems/minimum-white-tiles-after-covering-with-carpets/',
  complexity: 'O(n * numCarpets) time and space for the table. The page caps the floor at 12 tiles, carpets at 3 and carpet length at 4.',
  examples: [
    { label: 'Mixed floor', input: '{"floor":"10110101","numCarpets":2,"carpetLen":2}' },
    { label: 'All white covered', input: '{"floor":"11111","numCarpets":2,"carpetLen":3}' },
    { label: 'No white', input: '{"floor":"0000","numCarpets":1,"carpetLen":2}' },
  ],
}

export default function Problem2209Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FloorView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
