import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '965',
  title: 'Univalued Binary Tree',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tree: a level-order list of values, with null for a missing node',
  url: 'https://leetcode.com/problems/univalued-binary-tree/',
  complexity: 'O(n) time: each node is visited at most once. O(h) space for the stack, where h is the height.',
  examples: [
    { label: 'Every node matches', input: JSON.stringify({ tree: [3, 3, 3, 3, null, 3, 3] }) },
    { label: 'One outlier deep down', input: JSON.stringify({ tree: [7, 7, 7, 7, 7, 7, 8] }) },
    { label: 'Mismatch on the left', input: JSON.stringify({ tree: [4, 4, 4, 2, 4] }) },
    { label: 'Single node', input: '{"tree":[5]}' },
    { label: 'Equal values', input: '{"tree":[4,4,4,4,4,4,4]}' },
    { label: 'Largest values', input: '{"tree":[99,99,99,99,null,99,0]}' },
    { label: 'Long run: 31 slots', input: '{"tree":[48,49,71,33,56,86,15,17,90,32,62,16,4,37,40,31,null,53,null,null,38,null,36,69,23,61,null,41,null,92,62]}' },
  ],
}

const W = 520
const ROW = 66

// Positions in the level-order array map to a complete tree: row = depth, column = place within the row.
function place(i, levels) {
  const depth = Math.floor(Math.log2(i + 1))
  const slots = 2 ** depth
  const within = i + 1 - slots
  return { x: ((within + 0.5) / slots) * W, y: depth * ROW + 24, depth, levels }
}

function TreeArray({ tree, current, checked, mismatch }) {
  const levels = Math.floor(Math.log2(tree.length)) + 1
  const height = levels * ROW + 8
  return <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Binary tree being checked" style={{ width: '100%', maxWidth: W, height: 'auto' }}>
    {tree.map((value, i) => {
      if (value === null || i === 0) return null
      const parent = (i - 1) >> 1
      if (tree[parent] === null) return null
      const a = place(parent, levels), b = place(i, levels)
      return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--border)', strokeWidth: 2 }} />
    })}
    {tree.map((value, i) => {
      if (value === null) return null
      const { x, y } = place(i, levels)
      const isCurrent = i === current
      const isMismatch = i === mismatch
      const isChecked = checked.includes(i)
      const fill = isMismatch ? 'var(--danger)' : isCurrent ? 'var(--primary)' : isChecked ? 'var(--surface2)' : 'var(--surface)'
      return <g key={i}>
        <circle cx={x} cy={y} r={18} style={{ fill, stroke: isCurrent ? 'var(--primary)' : 'var(--border)', strokeWidth: 2 }} />
        <text x={x} y={y + 5} textAnchor="middle" style={{ fill: isCurrent || isMismatch ? 'var(--on-primary)' : 'var(--text)', fontSize: 14 }}>{value}</text>
        <text x={x} y={y - 24} textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 10 }}>{i}</text>
      </g>
    })}
  </svg>
}

export default function Problem965() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <TreeArray tree={run.input.tree} current={step.current ?? -1} checked={step.checked} mismatch={step.mismatch ?? -1} />
    <p style={{ margin: 0, color: 'var(--text)' }}>Target value from the root: <strong>{step.target}</strong>. Small numbers above each node are positions in the level-order list.</p>
    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Checked nodes are shaded. The node in blue is being compared now.</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
