import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function ComponentGraph({ run, step }) {
  const { n, edges } = run.input
  const W = 260, cx = W / 2, r = 100
  const pos = Array.from({ length: n }, (_, i) => ({ x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cx + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) }))
  return <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Graph with edges kept at the current time" style={{ width: 260, maxWidth: '100%' }}>
    {edges.map(([u, v, t], i) => {
      const kept = step.time === undefined || t > step.time
      return <line key={i} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke={kept ? 'var(--primary)' : 'var(--text)'} strokeOpacity={kept ? 1 : 0.35} strokeDasharray={kept ? undefined : '4 4'} strokeWidth="2" />
    })}
    {pos.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={12} fill="var(--surface2)" stroke="var(--text)" /><text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fill="var(--text)">{i}</text></g>)}
  </svg>
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every node begins as its own component.' },
    { id: 'group', label: 'Add back', description: 'Record the count, then keep the edges with this time; going down in time, edges are added back.' },
    { id: 'scan', label: 'Scan', description: 'Check the candidate times from 0 upward.' },
    { id: 'answer', label: 'Answer', description: 'The first time with at least k components is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges [[u, v, time]] and k',
  url: 'https://leetcode.com/problems/minimum-time-for-k-connected-components/',
  complexity: 'O(m log m) for sorting plus near-linear union-find work. The visualization caps input at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"edges":[[0,1,3]],"k":2}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1,2],[1,2,4]],"k":3}' },
  ],
}

export default function MinimumTimeKComponents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ComponentGraph run={run} step={step} />
    <output aria-label="Component count">{`Time ${step.time ?? '-'}: ${step.comps} components, need ${run.input.k}`}</output>
    <output aria-label="Edges">{`Edges: ${run.input.edges.map(([u, v, t]) => `${u}-${v}@${t}`).join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing edges can only add components, so the component count grows with time. The answer is the smallest time that reaches k.</p>
    <p>Working backward, the edges are added in decreasing time order with union-find, so the count before each group is known without rebuilding the graph.</p>
  </>} />
}
