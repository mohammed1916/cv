import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2242',
  phases: [
    { id: 'setup', label: 'Neighbours', description: 'List the three best neighbours of every node.' },
    { id: 'try', label: 'Path', description: 'Try a path c - u - v - d built around one edge.' },
    { id: 'done', label: 'Result', description: 'Return the best path score, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"scores":[5,1,3,2,4],"edges":[[0,1],[0,2],[0,3],[3,4]]}',
  url: 'https://leetcode.com/problems/maximum-score-of-a-node-sequence/',
  complexity: 'O(m * 9) time after sorting neighbours, and O(n + m) space. Keeping three neighbours per node is enough to find the best pair.',
  examples: [
    { label: 'Star', input: '{"scores":[5,1,3,2,4],"edges":[[0,1],[0,2],[0,3],[3,4]]}' },
    { label: 'Too short', input: '{"scores":[1,2,3,4],"edges":[[0,1],[1,2]]}' },
    { label: 'Smallest graph', input: '{"scores":[7,2,9,4],"edges":[]}' },
    { label: 'Equal scores tie', input: '{"scores":[5,5,5,5],"edges":[[0,1],[1,2],[2,3]]}' },
    { label: 'Long run: eight nodes', input: '{"scores":[12,50,3,27,8,41,19,33],"edges":[[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,7],[1,6]]}' },
  ],
}

const RADIUS = 110
const CENTER = 150

export default function NodeSequenceScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.scores.length
    const pos = i => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) }
    }
    const onPath = new Set(step.path || [])
    const edgeOnPath = (a, b) => step.path && step.path.some((x, i) => i < step.path.length - 1 && ((x === a && step.path[i + 1] === b) || (x === b && step.path[i + 1] === a)))
    return <>
      <svg viewBox="0 0 300 300" role="img" aria-label="Graph with node scores" style={{ width: '100%', maxWidth: 320, height: 'auto' }}>
        {run.input.edges.map(([a, b]) => {
          const p = pos(a), q = pos(b)
          return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={edgeOnPath(a, b) ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={edgeOnPath(a, b) ? 4 : 1.5} />
        })}
        {run.input.scores.map((s, i) => {
          const p = pos(i)
          return <g key={i}>
            <circle cx={p.x} cy={p.y} r={20} fill={onPath.has(i) ? 'var(--primary)' : 'var(--surface2)'} stroke="var(--text-muted)" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill={onPath.has(i) ? 'var(--surface)' : 'var(--text)'}>{`${i}:${s}`}</text>
          </g>
        })}
      </svg>
      <output aria-label="Best score">{`best ${step.best}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A four-node path needs one middle edge u - v, with one more node attached to each end. Try every edge in both directions and pair the best end node from each side.</p>
    <p>Only the three best neighbours of a node can matter, because a path needs at most one of them to be excluded as a repeat.</p>
  </>} />
}
