import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start the preorder walk at the root.' },
    { id: 'visit', label: 'Match', description: 'The node is the next value in the voyage.' },
    { id: 'flip', label: 'Flip', description: 'The left child is not next, so the right subtree goes first.' },
    { id: 'fail', label: 'Mismatch', description: 'The voyage cannot be matched.' },
    { id: 'done', label: 'Complete', description: 'Report the flipped nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree and voyage (JSON)',
  url: 'https://leetcode.com/problems/flip-binary-tree-to-match-preorder-traversal/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Impossible', input: '{"arr":[1,2],"voyage":[2,1]}' },
    { label: 'One flip', input: '{"arr":[1,2,3],"voyage":[1,3,2]}' },
    { label: 'Single node', input: '{"arr":[1],"voyage":[1]}' },
    { label: 'Three nodes, one flip', input: '{"arr":[1,2,3],"voyage":[1,3,2]}' },
    { label: 'Full tree, no flips', input: '{"arr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],"voyage":[1,2,4,8,9,5,10,11,3,6,12,13,7,14,15]}' },
    { label: 'Long run: 15 nodes, shuffled voyage', input: '{"arr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],"voyage":[6,5,3,11,2,12,9,7,14,8,10,4,15,13,1]}' },
  ],
}

export default function FlipToMatchPreorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const v of step.flipped) roles[run.root && findId(run.root, v)] = 'match'
    if (step.node !== null) roles[step.node] = step.phase === 'fail' ? 'pruned' : 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Voyage">{`Voyage position ${step.position} of ${run.input.voyage.length}: ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The preorder must match the voyage node by node. When a node’s left child is not the next value, flipping the node is the only way to fix it, so the flip is forced.</p>
    <p>If a node’s value is not the next value at all, no flips can help.</p>
  </>} />
}

function findId(node, value) {
  if (!node) return undefined
  if (node.value === value) return node.id
  return findId(node.left, value) ?? findId(node.right, value)
}
