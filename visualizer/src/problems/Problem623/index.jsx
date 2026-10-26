import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target depth', description: 'Decide where the new row goes.' },
    { id: 'descend', label: 'Descend', description: 'Walk down to depth d − 1.' },
    { id: 'insert', label: 'Insert row', description: 'Give each node two new children that adopt its old subtrees.' },
    { id: 'done', label: 'Complete', description: 'Return the new tree.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Tree, v, and d (JSON object with root, v and d)',
  url: 'https://leetcode.com/problems/add-one-row-to-tree/',
  complexity: 'O(n) time: each node is visited at most once, and O(w) extra space for the current level.',
  examples: [
    { label: 'Depth 2', input: '{"root":[4,2,6,3,1,5],"v":1,"d":2}' },
    { label: 'Depth 3', input: '{"root":[4,2,null,3,1],"v":1,"d":3}' },
    { label: 'New root', input: '{"root":[1],"v":7,"d":1}' },
  ],
}

export default function AddOneRow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title={step.phase === 'done' ? 'Tree after insertion' : 'Current tree'} root={run.root}
      roles={step.current !== null && step.current !== undefined ? { [step.current]: 'active' } : {}} />
    <output aria-label="Level order">[{(step.result ?? run.result).map(v => (v === null ? 'null' : v)).join(', ')}]</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Adoption:</strong> the new left node keeps the old left subtree, and the new right node keeps the old right subtree, so no value is lost.</p>
    <p>Target depth {run.input.d} with value {run.input.v}.</p>
  </>} />
}
