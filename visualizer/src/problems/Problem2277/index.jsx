import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreePathView from './TreePathView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2277',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n, edges and queries (e.g. {"n":5,"edges":[[0,1],[1,2],[2,3],[1,4]],"queries":[[0,3,4]]})',
  url: 'https://leetcode.com/problems/closest-node-to-path-in-tree/',
  complexity: 'O(n * q) time for q queries on an n-node tree, using a BFS per query. The visualization caps the tree at 10 nodes and 4 queries; the draft does not verify the official limits.',
  examples: [
    { label: 'Side branch', input: '{"n":5,"edges":[[0,1],[1,2],[2,3],[1,4]],"queries":[[0,3,4]]}' },
    { label: 'Node on path', input: '{"n":5,"edges":[[0,1],[1,2],[2,3],[1,4]],"queries":[[0,3,2]]}' },
    { label: 'Reversed query', input: '{"n":5,"edges":[[0,1],[1,2],[2,3],[1,4]],"queries":[[3,4,0]]}' },
  ],
}

export default function Problem2277Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreePathView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
