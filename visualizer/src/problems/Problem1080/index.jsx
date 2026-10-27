import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the root with a sum of zero.' },
    { id: 'keep', label: 'Keep', description: 'A leaf whose path sum reaches the limit stays.' },
    { id: 'remove', label: 'Remove', description: 'A node is removed when no sufficient path goes through it.' },
    { id: 'done', label: 'Complete', description: 'Report the remaining tree in level order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order JSON) and limit',
  url: 'https://leetcode.com/problems/insufficient-nodes-in-root-to-leaf-paths/',
  complexity: 'O(n) time and O(h) space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 3', input: '{"root":[1,2,-3,-5,null,4,null],"limit":-1}' },
  ],
}

export default function InsufficientNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.removed) roles[id] = 'pruned'
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Original tree (removed nodes marked)" root={run.original} roles={roles} />
      <output aria-label="Result">{`Level-order result so far: [${run.result.map(v => (v === null ? 'null' : v)).join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A node stays exactly when some root-to-leaf path through it has a sum at least the limit.</p>
    <p>Pruning bottom-up with the running sum decides each leaf once, and an inner node follows its children.</p>
  </>} />
}
