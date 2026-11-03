import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1496',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a path string of N, S, E and W (JSON)',
  url: 'https://leetcode.com/problems/path-crossing/',
  complexity: 'O(n) time and O(n) space: each step checks and records one point in a hash set.',
  examples: [
    { label: 'Loop back to start', input: '{"path":"NESWW"}' },
    { label: 'No revisit', input: '{"path":"NNEE"}' },
    { label: 'Back and forth', input: '{"path":"NSEE"}' },
  ],
}

const CELL = 22

export default function PathCrossing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { path } = run.input
    const { index, x, y, visited } = step.snapshot
    const xs = visited.map(([a]) => a)
    const ys = visited.map(([, b]) => b)
    const minX = Math.min(...xs, 0)
    const minY = Math.min(...ys, 0)
    const width = Math.max(...xs, 0) - minX + 1
    const height = Math.max(...ys, 0) - minY + 1
    const px = a => (a - minX) * CELL + CELL / 2
    const py = b => (Math.max(...ys, 0) - b) * CELL + CELL / 2
    return <>
      <p style={{ fontFamily: 'monospace', letterSpacing: 2 }} aria-label="Moves">{[...path].map((move, i) =>
        <span key={i} style={{ fontWeight: i === index ? 700 : 400, textDecoration: i === index ? 'underline' : 'none' }}>{move}</span>)}</p>
      <svg role="img" aria-label="Visited points" width={width * CELL} height={height * CELL} style={{ maxWidth: '100%', border: '1px solid var(--border)' }}>
        {visited.map(([a, b]) => <circle key={`${a},${b}`} cx={px(a)} cy={py(b)} r={4} fill="#0891b2" />)}
        <circle cx={px(x)} cy={py(y)} r={7} fill="none" stroke="#ef4444" strokeWidth={2} />
      </svg>
      <p>Current position: ({x}, {y}). Visited points: {visited.length}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Remember every point:</strong> a set of visited coordinates answers whether the new position was seen before in constant expected time.</p>
    <p><strong>Include the start:</strong> the origin counts as visited, so a walk that returns to it is a crossing.</p>
  </>} />
}
