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
    { label: 'Single house', input: '{"wells":[4],"pipes":[]}' },
    { label: 'Equal costs tie', input: '{"wells":[5,5,5],"pipes":[[1,2,5],[2,3,5],[1,3,5]]}' },
    { label: 'Largest costs', input: '{"wells":[1000,1000],"pipes":[[1,2,1000]]}' },
    { label: 'Long run: 20 houses, 40 pipes', input: '{"wells":[364,645,233,429,653,532,490,274,638,76,546,207,676,135,311,386,425,717,381,959],"pipes":[[14,4,140],[16,13,16],[18,3,301],[9,3,84],[13,8,87],[5,11,714],[1,10,457],[16,18,84],[20,1,125],[14,9,622],[8,11,773],[13,6,40],[2,15,842],[14,15,181],[5,15,245],[18,2,253],[7,17,582],[5,18,225],[2,13,484],[19,15,194],[4,20,36],[16,11,396],[16,20,976],[20,6,857],[4,14,275],[16,2,549],[9,8,27],[2,11,937],[15,11,834],[9,6,552],[16,2,612],[16,18,713],[18,9,59],[13,4,90],[2,15,815],[12,2,902],[1,19,439],[15,1,102],[6,18,60],[7,10,240]]}' },
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
