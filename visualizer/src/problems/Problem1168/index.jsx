import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { code, python, phases, parseInput, buildTrace } from './algorithm'
import GraphTraversalView from '../../components/shared/GraphTraversalView'

const definition = {
  number: '1168',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"wells": [costs per house], "pipes": [[house, house, cost], ...]}',
  url: 'https://leetcode.com/problems/optimize-water-distribution-in-a-village/description/',
  complexity: 'O(E log E) time and O(n) space for n houses and E candidate edges (n wells plus the pipes). The visualization caps n at 20 houses and 40 pipes.',
  examples: [
    { label: 'Pipes help', input: '{"wells":[5,4,6],"pipes":[[1,2,1],[2,3,2]]}' },
    { label: 'Wells only', input: '{"wells":[3,9,2],"pipes":[]}' },
    { label: 'Pipe loses', input: '{"wells":[1,1],"pipes":[[1,2,50]]}' },
  ],
}

const STATE_LABEL = { pending: 'waiting', taken: 'kept', skipped: 'skipped' }

export default function OptimizeWaterDistributionVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const snap = step.snapshot
        const houses = run.input.wells.length
        const labels = ['source', ...Array.from({ length: houses }, (_, i) => `house ${i + 1}`)]
        const current = snap.edges[snap.current] ?? null
        const rootSource = snap.groups[0]
        const connected = snap.groups.map((root, node) => (root === rootSource ? node : -1)).filter(node => node >= 0)
        const kept = snap.edges.filter((_, index) => snap.states[index] === 'taken').map(edge => [edge.u, edge.v])
        return <>
          <GraphTraversalView title="Wells (source to houses) and pipes" n={houses + 1}
            edges={snap.edges.map(edge => [edge.u, edge.v])} labels={labels}
            current={current ? current.u : null} neighbour={current ? current.v : null}
            done={connected} tags={Object.fromEntries(snap.groups.map((root, node) => [node, `group ${root}`]))}
            showFrontier={false} />
          <p>{kept.length ? `Kept so far: ${kept.map(([u, v]) => (u === 0 ? `well ${v}` : `pipe ${u}-${v}`)).join(', ')}` : 'Nothing kept yet.'}</p>
          <table className="algorithm-edge-table" aria-label="Candidate edges in cost order">
            <thead><tr><th>Order</th><th>Edge</th><th>Cost</th><th>Decision</th></tr></thead>
            <tbody>{snap.edges.map((edge, index) => (
              <tr key={edge.id} data-state={snap.states[index]} aria-current={snap.current === index ? 'step' : undefined}>
                <td>{index + 1}</td>
                <td>{edge.kind === 'well' ? `source to house ${edge.v} (well)` : `house ${edge.u} to house ${edge.v} (pipe)`}</td>
                <td>{edge.cost}</td>
                <td>{STATE_LABEL[snap.states[index]]}</td>
              </tr>
            ))}</tbody>
          </table>
        </>
      }}
      renderReasoning={({ step }) => <p>Running total: {step.snapshot.total}. Group labels: {step.snapshot.groups.join(', ')}.</p>}
    />
  )
}
