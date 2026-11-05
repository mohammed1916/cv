import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LonelyNodesView from './LonelyNodesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1469',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with tree (LeetCode level-order array, null for missing children)',
  url: 'https://leetcode.com/problems/find-all-the-lonely-nodes/description/',
  complexity: 'O(n) time and O(n) space for n tree nodes. The visualization caps the tree at 15 positions with values from 0 to 9. Output order is not fixed.',
  examples: [
    { label: 'Chain of single children', input: '{"tree":[5,3,null,1]}' },
    { label: 'Two lonely nodes', input: '{"tree":[6,2,7,null,4,null,null,9]}' },
    { label: 'Full tree', input: '{"tree":[1,2,3]}' },
  ],
}

export default function Problem1469Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LonelyNodesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
