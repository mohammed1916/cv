import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'edge', label: 'Edges', description: 'Test each edge against the parity labels.' },
    { id: 'done', label: 'Result', description: 'Report how many edges were kept.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges ([u, v, weight] with weight 0 or 1)',
  url: 'https://leetcode.com/problems/incremental-even-weighted-cycle-queries/',
  complexity: 'Near-linear union-find work per edge with parity labels. The visual caps n at 10 and edges at 14.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1,0],[2,1,1],[3,1,0],[0,3,1]]}' },
    { label: 'Even triangle', input: '{"n":4,"edges":[[1,0,1],[2,1,1],[3,2,0]]}' },
    { label: 'No edges', input: '{"n":1,"edges":[]}' },
    { label: 'Two nodes, weight one', input: '{"n":2,"edges":[[0,1,1]]}' },
    { label: 'Parallel edges', input: '{"n":3,"edges":[[0,1,0],[0,1,1],[1,2,1]]}' },
    { label: 'Long run: 10 nodes, 14 edges', input: '{"n":10,"edges":[[7,8,1],[4,3,0],[0,6,0],[7,1,1],[8,1,1],[0,4,1],[7,6,0],[3,8,1],[1,7,0],[2,7,1],[8,7,1],[1,3,0],[6,2,1],[4,1,0]]}' },
  ],
}

// Nodes on a circle. Kept edges are solid, skipped edges dashed; the edge being tested is thick.
function Graph({ n, edges, index, results }) {
  const size = 280, r = 105, c = size / 2
  const pos = v => ({ x: c + r * Math.cos((2 * Math.PI * v) / n - Math.PI / 2), y: c + r * Math.sin((2 * Math.PI * v) / n - Math.PI / 2) })
  return <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label={`Graph with ${n} nodes; kept edges are solid, skipped edges are dashed`}>
    {edges.map(([u, v, w], i) => {
      if (i > index) return null
      const a = pos(u), b = pos(v)
      const kept = results[i]
      return <g key={i}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i === index ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={i === index ? 4 : 2} strokeDasharray={kept ? undefined : '6 4'} />
        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} fontSize="12" textAnchor="middle" fill="var(--text)">w{w}</text>
      </g>
    })}
    {Array.from({ length: n }, (_, v) => v).map(v => { const p = pos(v); return <g key={v}>
      <circle cx={p.x} cy={p.y} r="14" fill="var(--surface2)" stroke="var(--text)" />
      <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill="var(--text)">{v}</text>
    </g> })}
  </svg>
}

export default function IncrementalEvenWeightedCycleQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    return <>
      <Graph n={run.input.n} edges={run.input.edges} index={step.index >= 0 ? step.index : run.input.edges.length - 1} results={step.kept} />
      <section className="algorithm-sequence" aria-label="Node parity labels">
        <h3>Node parity labels</h3>
        <div className="algorithm-sequence__cells">{Array.from({ length: run.input.n }, (_, v) => (
          <div key={v} className="algorithm-sequence__cell" data-role={step.edge && (step.edge[0] === v || step.edge[1] === v) ? 'window' : ''}>
            <small>node</small><strong>{v}</strong><span>root {step.parent[v]}, parity {step.par[v]}</span>
          </div>))}</div>
      </section>
      <output aria-label="Edge status">{`Kept ${step.count}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>An edge is safe to keep when the graph still admits a 0 or 1 label on every node such that each edge weight equals the xor of its endpoint labels. That is exactly the condition that every cycle has even weight.</p>
    <p>Each node stores its parity relative to its component root, so a new edge inside one component can be checked in one comparison.</p>
  </>} />
}
