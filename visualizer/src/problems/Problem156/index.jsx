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

const GAP_X = 52
const GAP_Y = 64

// Positions come from the original tree (in-order x, depth y), so nodes stay put while pointers turn.
function layoutOf(links, rootVal) {
  const byVal = new Map(links.map(l => [l.val, l]))
  const pos = new Map()
  let x = 0
  const walk = (val, depth) => {
    if (val === null || val === undefined) return
    const node = byVal.get(val)
    walk(node.left, depth + 1)
    pos.set(val, { x: x * GAP_X + 30, y: depth * GAP_Y + 30 })
    x++
    walk(node.right, depth + 1)
  }
  walk(rootVal, 0)
  return pos
}

export default function BinaryTreeUpsideDown() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { links, cur, prev, prevRight } = step.snapshot
    const initial = run.frames[0].snapshot
    const pos = layoutOf(initial.links, run.input.values[0])
    const width = Math.max(...[...pos.values()].map(p => p.x)) + 40
    const height = Math.max(...[...pos.values()].map(p => p.y)) + 40
    const edges = []
    links.forEach(l => {
      if (l.left !== null && pos.has(l.left)) edges.push({ from: l.val, to: l.left, kind: 'left' })
      if (l.right !== null && pos.has(l.right)) edges.push({ from: l.val, to: l.right, kind: 'right' })
    })
    const fill = val => (val === cur ? 'var(--primary)' : val === prev ? 'var(--surface2)' : 'transparent')
    return <>
      <svg role="img" aria-label="Tree with current child links" viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: 'block' }}>
        {edges.map(e => {
          const a = pos.get(e.from), b = pos.get(e.to)
          if (!a || !b) return null
          return <line key={`${e.from}-${e.to}-${e.kind}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={e.kind === 'left' ? 'var(--text)' : 'var(--primary)'} strokeWidth={2}
            strokeDasharray={e.kind === 'right' ? '5 4' : undefined} />
        })}
        {[...pos].map(([val, p]) => <g key={val} data-node={val}>
          <circle cx={p.x} cy={p.y} r={18} fill={fill(val)} stroke="var(--text)" strokeWidth={val === cur ? 3 : 1} />
          <text x={p.x} y={p.y + 5} textAnchor="middle" fill="var(--text)" fontFamily="monospace" fontSize={14}>{val}</text>
        </g>)}
      </svg>
      <p style={{ color: 'var(--text)' }}>
        Solid line: left child. Dashed line: right child. Current node {cur ?? '-'}; previous node {prev ?? '-'}; saved right child {prevRight ?? '-'}.
      </p>
      <table aria-label="Child links for each node" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', color: 'var(--text)' }}>
        <thead><tr><th>node</th><th>left</th><th>right</th></tr></thead>
        <tbody>{links.map(link => <tr key={link.val} data-node={link.val} style={{ background: link.val === cur ? 'var(--surface2)' : 'transparent' }}>
          <td>{link.val}</td><td>{link.left ?? '-'}</td><td>{link.right ?? '-'}</td>
        </tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the leftmost path becomes the new right-hand spine. Each node on it keeps its old left child as the next node to turn.</p>
    <p><strong>Why the saved right child:</strong> before the node's right pointer is reused as the link back to the previous node, its right child is stored, then attached as the new left child.</p>
  </>} />
}
