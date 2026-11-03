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
    { label: 'Example', input: '{"n":3,"edges":[[0,1,1],[1,2,1],[0,2,1]]}' },
    { label: 'Even triangle', input: '{"n":3,"edges":[[0,1,1],[1,2,0],[0,2,1]]}' },
  ],
}

export default function IncrementalEvenWeightedCycleQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Node parity labels">
      <h3>Node parity labels</h3>
      <div className="algorithm-sequence__cells">{Array.from({ length: run.input.n }, (_, v) => (
        <div key={v} className="algorithm-sequence__cell" data-role={step.edge && (step.edge[0] === v || step.edge[1] === v) ? 'window' : ''}>
          <small>node</small><strong>{v}</strong><span>root {step.parent[v]}, parity {step.par[v]}</span>
        </div>))}</div>
    </section>
    <output aria-label="Edge status">{`Kept ${step.count}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>An edge is safe to keep when the graph still admits a 0 or 1 label on every node such that each edge weight equals the xor of its endpoint labels. That is exactly the condition that every cycle has even weight.</p>
    <p>Each node stores its parity relative to its component root, so a new edge inside one component can be checked in one comparison.</p>
  </>} />
}
