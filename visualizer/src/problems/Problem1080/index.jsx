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
    { label: 'Mixed values with limit three', input: '{"root":[7,-3,5,-9,4,null,8],"limit":3}' },
    { label: 'Single node', input: '{"root":[5],"limit":-1}' },
    { label: 'Left-leaning chain with gap', input: '{"root":[1,2,null,3],"limit":-1000}' },
    { label: 'Extreme values, large limit', input: '{"root":[100,-100,100,-100,100,-100,100],"limit":1000}' },
    { label: 'Long run: fifteen nodes', input: '{"root":[41,99,-61,-41,-39,80,46,74,-22,91,5,-86,-26,84,-89],"limit":-150}' },
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
