import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3814,
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order machines by cost and build prefix maxima of capacity.' },
    { id: 'single', label: 'Single', description: 'One affordable machine can be the whole selection.' },
    { id: 'pair', label: 'Pair', description: 'Pair the current machine with the best cheaper partner that keeps the cost under budget.' },
    { id: 'done', label: 'Result', description: 'Report the best total capacity.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with costs, capacity and budget',
  url: 'https://leetcode.com/problems/maximum-capacity-within-budget/',
  complexity: 'O(n^2) for this visual trace; the same idea with a pointer gives O(n log n) overall.',
  examples: [
    { label: 'Pairs', input: '{"costs":[6,2,9,4],"capacity":[3,7,2,5],"budget":10}' },
    { label: 'Too expensive', input: '{"costs":[5,5],"capacity":[3,4],"budget":5}' },
  ],
}

// Cost bars in sorted order with the budget line; the current machine r and its partner limit k are marked.
function CostBars({ budget, sorted, costs, r, k }) {
  const max = Math.max(budget, ...sorted.map(m => costs[m]), 1)
  return <div className="cost-bars" role="img" aria-label={`Costs in sorted order; budget ${budget}`}>
    {sorted.map((m, pos) => {
      const h = (costs[m] / max) * 120
      const cls = pos === r ? 'is-current' : pos === k ? 'is-partner' : pos < k ? 'is-prefix' : ''
      return <div key={pos} className={`cost-bars__bar ${cls}`} style={{ height: h, background: pos === r ? 'var(--primary)' : pos === k ? 'var(--accent, var(--primary))' : 'var(--surface2)', border: '1px solid var(--text-muted)', width: 28, display: 'inline-block', margin: '0 3px', verticalAlign: 'bottom' }} title={`position ${pos}, machine ${m}, cost ${costs[m]}`}>
        <small style={{ display: 'block', textAlign: 'center', color: 'var(--text)' }}>{costs[m]}</small>
      </div>
    })}
    <div style={{ borderTop: '2px dashed var(--text)', marginTop: 4, fontSize: 12, color: 'var(--text)' }}>budget {budget}: a pair must total less than this</div>
  </div>
}

export default function MaximumCapacityWithinBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <CostBars budget={run.input.budget} sorted={step.sorted} costs={run.input.costs} r={step.r} k={step.k} />
    <IndexedSequence label="Machines by sorted position" length={step.sorted.length} active={step.r}
      valueAt={pos => run.input.capacity[step.sorted[pos]]}
      roleAt={pos => pos === step.k ? 'partner limit k' : pos < step.k ? 'prefix' : ''} />
    <table aria-label="Machines sorted by cost">
      <thead><tr><th>position</th><th>machine</th><th>cost</th><th>capacity</th><th>prefix max</th></tr></thead>
      <tbody>{step.sorted.map((m, pos) => <tr key={pos} data-current={step.r === pos ? 'yes' : undefined} data-partner={step.k === pos ? 'yes' : undefined}>
        <td>{pos}</td><td>{m}</td><td>{run.input.costs[m]}</td><td>{run.input.capacity[m]}</td><td>{step.prefix[pos]}</td></tr>)}</tbody>
    </table>
    <output aria-label="Best so far">{`budget ${run.input.budget} · best ${step.best}${step.r >= 0 ? ` · current position ${step.r}${step.k >= 0 ? `, partner up to ${step.k}` : ''}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>After sorting by cost, every machine cheaper than a given one forms a prefix. A partner that is affordable with the current machine is therefore any machine in that prefix.</p>
    <p>The best partner is the one with the largest capacity in that prefix, which the prefix maximum provides immediately.</p>
  </>} />
}
