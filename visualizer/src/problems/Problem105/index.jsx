import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Traversals (JSON object with preorder and inorder)',
  url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
  complexity: 'O(n) time and O(n) space with a value-to-position map. The visualization caps each traversal at 20 values.',
  examples: [
    { label: 'Mixed tree', input: '{"preorder":[5,3,1,4,8,7,9],"inorder":[1,3,4,5,7,8,9]}' },
    { label: 'Left chain', input: '{"preorder":[4,3,2,1],"inorder":[1,2,3,4]}' },
    { label: 'Right chain', input: '{"preorder":[1,2,3],"inorder":[1,2,3]}' },
    { label: 'Single node', input: '{"preorder":[7],"inorder":[7]}' },
  ],
}

// BinaryTreeLane needs stable ids; here each value is unique, so the value is the id.
function withIds(node) {
  if (!node) return null
  return { id: node.value, value: node.value, left: withIds(node.left), right: withIds(node.right) }
}

export default function ConstructBinaryTreeFromPreorderAndInorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const snap = step.snapshot
    const [ps, pe] = snap.preRange ?? [0, 0]
    const [is, ie] = snap.inRange ?? [0, 0]
    return <>
      <IndexedSequence label="Preorder" length={snap.preorder.length} valueAt={i => snap.preorder[i]}
        active={snap.root === null || snap.root === undefined ? -1 : ps}
        roleAt={i => (i >= ps && i < pe ? 'range' : '')} />
      <IndexedSequence label="Inorder" length={snap.inorder.length} valueAt={i => snap.inorder[i]}
        active={snap.mid ?? -1}
        roleAt={i => (i === snap.mid ? 'root' : i >= is && i < ie ? 'range' : '')} />
      <BinaryTreeLane title="Tree built so far" root={withIds(snap.tree)}
        roles={snap.root === null || snap.root === undefined ? {} : { [snap.root]: 'active' }}
        tags={Object.fromEntries((snap.placed ?? []).map(p => [p.value, p.side]))} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.snapshot.root !== null && step.snapshot.root !== undefined
      ? `Current subtree root: ${step.snapshot.root}. Its preorder slice is positions ${step.snapshot.preRange[0]} to ${step.snapshot.preRange[1] - 1}.`
      : 'Empty slices produce no node.'}</p>
    <p>Preorder names the root of each subtree, and inorder separates the left values from the right values, so each recursive call receives a smaller, consistent pair of slices.</p>
  </>} />
}
