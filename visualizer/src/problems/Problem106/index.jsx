import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Traversals (JSON object with inorder and postorder)',
  url: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/',
  complexity: 'O(n) time and O(n) space with a value-to-position map. The visualization caps each traversal at 20 values.',
  examples: [
    { label: 'Mixed tree', input: '{"inorder":[1,3,4,5,7,8,9],"postorder":[1,4,3,7,9,8,5]}' },
    { label: 'Right chain', input: '{"inorder":[1,2,3,4],"postorder":[4,3,2,1]}' },
    { label: 'Single node', input: '{"inorder":[7],"postorder":[7]}' },
  ],
}

// Nested node view: shows the subtrees placed so far, so each attachment is visible.
function TreeView({ node, label = 'root' }) {
  if (!node) return null
  return <li><span>{label}: <strong>{node.value}</strong></span>
    {(node.left || node.right) && <ul>
      {node.left && <TreeView node={node.left} label="left" />}
      {node.right && <TreeView node={node.right} label="right" />}
    </ul>}
  </li>
}

export default function ConstructBinaryTreeFromInorderAndPostorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const snap = step.snapshot
    const [ps, pe] = snap.postRange ?? [0, 0]
    const [is, ie] = snap.inRange ?? [0, 0]
    return <>
      <IndexedSequence label="Postorder" length={snap.postorder.length} valueAt={i => snap.postorder[i]}
        active={pe > ps ? pe - 1 : -1}
        roleAt={i => (i === pe - 1 && pe > ps ? 'root' : i >= ps && i < pe ? 'range' : '')} />
      <IndexedSequence label="Inorder" length={snap.inorder.length} valueAt={i => snap.inorder[i]}
        active={snap.mid ?? -1}
        roleAt={i => (i === snap.mid ? 'root' : i >= is && i < ie ? 'range' : '')} />
      <section aria-label="Tree built so far">
        <h3>Tree built so far</h3>
        {snap.tree ? <ul><TreeView node={snap.tree} /></ul> : <p>No node yet.</p>}
      </section>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.snapshot.root !== null && step.snapshot.root !== undefined
      ? `Current subtree root: ${step.snapshot.root}. Its postorder slice is positions ${step.snapshot.postRange[0]} to ${step.snapshot.postRange[1] - 1}.`
      : 'Empty slices produce no node.'}</p>
    <p>Postorder ends each subtree with its root, so reading it from the back gives roots top-down. Inorder then splits the remaining values into left and right parts, and the right subtree is built first because it occupies the postorder positions just before the root.</p>
  </>} />
}
