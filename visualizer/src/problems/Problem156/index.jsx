import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '156',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values in level order (JSON; null for a missing child)',
  url: 'https://leetcode.com/problems/binary-tree-upside-down/',
  complexity: 'O(n) time and O(h) extra space for the recursive version; this iterative walk uses O(1) extra pointers.',
  examples: [
    { label: 'Five nodes', input: '{"values":[1,2,3,4,5]}' },
    { label: 'Single node', input: '{"values":[1]}' },
    { label: 'Left-heavy with gap', input: '{"values":[10,20,30,40,null,50,null]}' },
  ],
}

export default function BinaryTreeUpsideDown() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { links, cur, prev, prevRight } = step.snapshot
    const show = v => (v === null || v === undefined ? '-' : v)
    return <>
      <table aria-label="Child links for each node" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>node</th><th>left</th><th>right</th><th>role</th></tr></thead>
        <tbody>{links.map(link => <tr key={link.val} data-node={link.val} style={{
          background: link.val === cur ? 'var(--surface2)' : link.val === prev ? '#a5f3fc' : 'transparent',
        }}>
          <td>{link.val}</td><td>{show(link.left)}</td><td>{show(link.right)}</td>
          <td>{link.val === cur ? 'current' : link.val === prev ? 'previous' : link.val === prevRight ? 'saved right child' : ''}</td>
        </tr>)}</tbody>
      </table>
      <p>Current: {show(cur)}. Previous: {show(prev)}. Saved right child: {show(prevRight)}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the leftmost path becomes the new right-hand spine. Each node on it keeps its old left child as the next node to turn.</p>
    <p><strong>Why the saved right child:</strong> before the node's right pointer is reused as the link back to the previous node, its right child is stored, then attached as the new left child.</p>
  </>} />
}
