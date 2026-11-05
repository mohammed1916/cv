import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CycleView from './CycleView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2204',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with n and edges, e.g. {"n":5,"edges":[[0,1],[1,2],[2,0],[2,3],[3,4]]}',
  url: 'https://leetcode.com/problems/distance-to-a-cycle-in-undirected-graph/',
  complexity: 'O(n + m) time with leaf peeling and one multi-source BFS. The page caps the graph at 9 nodes.',
  examples: [
    { label: 'Triangle with tail', input: '{"n":5,"edges":[[0,1],[1,2],[2,0],[2,3],[3,4]]}' },
    { label: 'Plain triangle', input: '{"n":3,"edges":[[0,1],[1,2],[2,0]]}' },
    { label: 'Cycle of four', input: '{"n":4,"edges":[[0,1],[1,2],[2,3],[3,1]]}' },
  ],
}

export default function Problem2204Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CycleView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
