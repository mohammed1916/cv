import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from './algorithm'

const definition = {
  number: '1168',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
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
      renderVisual={({ step }) => {
        const snap = step.snapshot
        return <table className="algorithm-edge-table" aria-label="Candidate edges in cost order">
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
      }}
      renderReasoning={({ step }) => <p>Running total: {step.snapshot.total}. Group labels: {step.snapshot.groups.join(', ')}.</p>}
    />
  )
}
