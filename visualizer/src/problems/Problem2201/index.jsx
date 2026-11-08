import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigGridView from './DigGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2201',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with n, artifacts and dig, e.g. {"n":3,"artifacts":[[0,0,0,0],[0,1,1,2]],"dig":[[0,0],[1,1]]}',
  url: 'https://leetcode.com/problems/count-artifacts-that-can-be-extracted/',
  complexity: 'O(d + total artifact area) time with a hash set of dug cells. The page caps the grid at 6 by 6 and artifacts at 5.',
  examples: [
    { label: 'Mixed', input: '{"n":3,"artifacts":[[0,0,0,0],[0,1,1,2]],"dig":[[0,0],[0,1],[1,1],[1,2]]}' },
    { label: 'Buried', input: '{"n":2,"artifacts":[[0,0,1,1]],"dig":[[0,0],[1,1]]}' },
    { label: 'Fully dug', input: '{"n":2,"artifacts":[[0,0,1,1]],"dig":[[0,0],[0,1],[1,0],[1,1]]}' },
    { label: 'Smallest grid', input: '{"n":1,"artifacts":[[0,0,0,0]],"dig":[[0,0]]}' },
    { label: 'Two single cells', input: '{"n":2,"artifacts":[[0,0,0,0],[1,1,1,1]],"dig":[[0,0],[0,1],[1,0],[1,1]]}' },
    { label: 'Long run: 6 by 6 grid', input: '{"n":6,"artifacts":[[0,0,1,1],[2,2,3,4],[4,0,5,5],[5,5,5,5],[1,4,2,5]],"dig":[[0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[0,5],[5,0]]}' },
  ],
}

export default function Problem2201Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
