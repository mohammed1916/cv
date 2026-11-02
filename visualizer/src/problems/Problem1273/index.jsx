import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeDeleteView from './TreeDeleteView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1273',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with parent (parent[0] = -1 for the root) and value arrays',
  url: 'https://leetcode.com/problems/delete-tree-nodes/description/',
  complexity: 'O(n) time and O(n) space for n nodes. The visualization caps the tree at 12 nodes and values from -9 to 9; the draft does not verify the official bounds.',
  examples: [
    { label: 'Partial deletion', input: '{"parent":[-1,0,0,1,1],"value":[4,1,-1,0,2]}' },
    { label: 'Whole subtree gone', input: '{"parent":[-1,0,1,1],"value":[7,2,-2,0]}' },
    { label: 'Nothing deleted', input: '{"parent":[-1,0,0],"value":[1,2,3]}' },
  ],
}

export default function Problem1273Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeDeleteView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
