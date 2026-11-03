import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
    { label: 'Pairs', input: '{"costs":[4,8,5,3],"capacity":[1,5,2,7],"budget":8}' },
    { label: 'Too expensive', input: '{"costs":[5,5],"capacity":[3,4],"budget":5}' },
  ],
}

export default function MaximumCapacityWithinBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
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
