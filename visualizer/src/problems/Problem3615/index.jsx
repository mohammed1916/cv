import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function PathGraph({ run, step }) {
  const n = run.input.n
  const W = 260, cx = W / 2, r = 100
  const pos = Array.from({ length: n }, (_, i) => ({ x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cx + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) }))
  return <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Graph with the node letters" style={{ width: 260, maxWidth: '100%' }}>
    {run.input.edges.map(([u, v], i) => <line key={i} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke="var(--text)" strokeOpacity="0.5" strokeWidth="2" />)}
    {pos.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={13} fill="var(--surface2)" stroke="var(--text)" /><text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--text)">{run.input.label[i]}</text></g>)}
  </svg>
}

const definition = {
  phases: [
    { id: 'start', label: 'Centers', description: 'Start from single nodes and from edges whose ends share a letter.' },
    { id: 'grow', label: 'Grow', description: 'Extend both ends outward with unused neighbours that share a letter.' },
    { id: 'done', label: 'Complete', description: 'Report the longest palindrome found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges [[a, b]] and label',
  url: 'https://leetcode.com/problems/longest-palindromic-path-in-graph/',
  complexity: 'Each state is (end, end, visited set), so the work is O(n^2 * 2^n * n^2) in the worst case. The official limit is n <= 14.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1],[1,2]],"label":"aba"}' },
    { label: 'Example 3', input: '{"n":4,"edges":[[0,2],[0,3],[3,1]],"label":"bbac"}' },
  ],
}

export default function LongestPalindromicPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PathGraph run={run} step={step} />
    <output aria-label="Label">{`Labels: ${run.input.label}`}</output>
    <output aria-label="Search">{`States: ${step.states}. Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is grown from its centre outward. Each step adds one node at each end, so the two ends must carry the same letter.</p>
    <p>A bitmask records the nodes already on the path, so no node is reused and the result is a simple path.</p>
  </>} />
}
