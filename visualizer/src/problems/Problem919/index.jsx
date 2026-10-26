import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import OperationLog from '../../components/shared/OperationLog'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Constructor', description: 'Begin scanning the initial tree.' },
    { id: 'scan', label: 'Scan node', description: 'Decide whether a node still has a free child slot.' },
    { id: 'insert', label: 'insert', description: 'Attach under the front candidate and queue the new node.' },
    { id: 'root', label: 'get_root', description: 'Return the root.' },
    { id: 'done', label: 'Complete', description: 'All operations finished.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {tree, ops} (JSON)',
  url: 'https://leetcode.com/problems/complete-binary-tree-inserter/',
  complexity: 'O(n) constructor, O(1) per insert and get_root. The tree is a level-order list without nulls; at most 63 nodes in total.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,2],"ops":[["insert",3],["insert",4],["get_root"]]}' },
    { label: 'Fill a level', input: '{"tree":[1,2,3,4,5],"ops":[["insert",6],["insert",7],["insert",8],["get_root"]]}' },
  ],
}

export default function CompleteBinaryTreeInserter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.candidates.forEach(i => { roles[i] = 'visited' })
    if (step.node >= 0) roles[step.node] = 'active'
    if (step.newNode >= 0) roles[step.newNode] = 'match'
    const ops = run.input.ops.map((o, i) => ({ name: o[0], args: o.slice(1), returned: o[0] === 'insert' ? run.result[i] : run.result[i] }))
    return <>
      <BinaryTreeLane title="Tree (shaded: candidates with a free slot)" root={treeFromLevelOrder(step.values)} roles={roles} />
      <IndexedSequence label="Candidate queue (front first, node values)" length={step.candidates.length} valueAt={i => step.values[step.candidates[i]]} active={step.candidates.length ? 0 : -1} />
      <OperationLog title="Operations" ops={ops} current={step.opIndex} through={step.opIndex} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>In a complete tree the next free position is always the first node, in level order, with a missing child. Because nodes fill left to right, that front candidate leaves the queue only after receiving its right child.</p>
  </>} />
}
