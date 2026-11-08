import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function PrerequisiteMap({ run, mask, node }) {
  const n = run.input.n
  const prereqs = Array.from({ length: n }, () => [])
  for (const [u, v] of run.input.edges) prereqs[v].push(u)
  return <section aria-label="Prerequisite map">
    <h4>Prerequisite map: node to the nodes that must be placed first</h4>
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
      {Array.from({ length: n }, (_, v) => {
        const placed = Boolean(mask & (1 << v))
        const ready = prereqs[v].every(u => mask & (1 << u))
        const state = placed ? 'placed' : ready ? 'ready' : 'waiting'
        return <li key={v} data-state={state} aria-current={node === v ? 'step' : undefined}
          style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 8px', background: node === v ? 'var(--primary)' : placed ? 'var(--surface2)' : 'transparent', color: node === v ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
          <strong>{v}</strong> (score {run.input.score[v]}) {'<- '}{prereqs[v].length ? prereqs[v].join(', ') : 'none'} : {state}
        </li>
      })}
    </ul>
  </section>
}

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No node is placed; the profit is 0.' },
    { id: 'extend', label: 'Extend', description: 'Place a node whose predecessors are all placed.' },
    { id: 'done', label: 'Complete', description: 'Report the best profit over all nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges and score, for example {"n":3,"edges":[[0,1],[0,2]],"score":[1,6,3]}',
  url: 'https://leetcode.com/problems/maximum-profit-from-valid-topological-order-in-dag/',
  complexity: 'O(2^n * n) time and O(2^n) space. The visualization caps n at 8.',
  examples: [
    { label: 'Own case 1', input: '{"n":2,"edges":[[0,1]],"score":[3,2]}' },
    { label: 'Own case 2', input: '{"n":3,"edges":[[0,2],[0,1]],"score":[3,6,1]}' },
    { label: 'One node', input: '{"n":1,"edges":[],"score":[7]}' },
    { label: 'Equal scores', input: '{"n":3,"edges":[[0,1],[1,2]],"score":[5,5,5]}' },
    { label: 'Largest scores', input: '{"n":4,"edges":[[0,2],[1,2],[2,3]],"score":[100000,100000,1,100000]}' },
    { label: 'Long run: 8 nodes', input: '{"n":8,"edges":[[0,2],[1,6],[2,5],[2,6],[2,7],[3,6],[4,7],[6,7]],"score":[24704,62972,10203,80000,20175,65222,56516,41322]}' },
  ],
}

export default function TopologicalProfit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PrerequisiteMap run={run} mask={step.mask} node={step.node} />
    <output aria-label="Placed set">{`Placed set (bitmask ${step.mask.toString(2).padStart(run.input.n, '0')}): ${[...Array(run.input.n).keys()].filter(v => step.mask & (1 << v)).join(', ') || 'none'}`}</output>
    <output aria-label="Profit">{`Best profit for this set: ${step.value}${step.node >= 0 ? `, last placed node ${step.node}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A node placed at position p earns score times p, so the order matters. Positions are assigned left to right.</p>
    <p>A set of placed nodes fixes the next position, so the best profit for each set can be built from smaller sets with one node added.</p>
  </>} />
}
