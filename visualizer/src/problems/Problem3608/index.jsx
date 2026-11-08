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
    { label: 'Four-node cycle, two picks', input: '{"n":4,"edges":[[0,1,5],[1,2,3],[2,3,8],[0,3,6]],"k":2}' },
    { label: 'One road, one pick', input: '{"n":3,"edges":[[0,1,7]],"k":1}' },
    { label: 'Two nodes, one edge', input: '{"n":2,"edges":[[0,1,1]],"k":1}' },
    { label: 'Equal edge times', input: '{"n":3,"edges":[[0,1,5],[1,2,5],[0,2,5]],"k":2}' },
    { label: 'Largest edge time', input: '{"n":2,"edges":[[0,1,1000000000]],"k":2}' },
    { label: 'Long run: 12 nodes, 20 edges', input: '{"n":12,"edges":[[6,3,43],[10,7,86],[3,8,66],[11,10,84],[6,1,24],[0,1,90],[3,6,51],[9,5,58],[9,0,46],[1,11,72],[7,10,11],[8,9,18],[1,5,67],[5,9,42],[11,6,13],[8,3,94],[0,3,81],[8,4,90],[4,5,30],[6,10,60]],"k":6}' },
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
