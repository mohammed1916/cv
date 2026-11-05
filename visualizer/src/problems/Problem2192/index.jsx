import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AncestorView from './AncestorView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2192',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with n and edges, e.g. {"n":4,"edges":[[0,1],[0,2],[1,3],[2,3]]}',
  url: 'https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/',
  complexity: 'O(n * (n + m)) time in the worst case for ancestor sets, and O(n^2) space. The page caps the graph at 8 nodes.',
  examples: [
    { label: 'Diamond', input: '{"n":4,"edges":[[0,1],[0,2],[1,3],[2,3]]}' },
    { label: 'Chain', input: '{"n":3,"edges":[[0,1],[1,2]]}' },
    { label: 'No edges', input: '{"n":2,"edges":[]}' },
  ],
}

export default function Problem2192Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <AncestorView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
