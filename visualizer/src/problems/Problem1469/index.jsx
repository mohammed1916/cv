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
    { label: 'Single node', input: '{"tree":[4]}' },
    { label: 'Equal values', input: '{"tree":[3,3,3]}' },
    { label: 'Largest: full tree of 15', input: '{"tree":[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]}' },
    { label: 'Long run: 15 nodes with gaps', input: '{"tree":[5,1,3,6,null,4,null,2,7,5,null,7,1,8,4]}' },
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
