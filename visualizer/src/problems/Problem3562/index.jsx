import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bottom up', description: 'Begin the walk so reports are decided before their boss.' },
    { id: 'combine', label: 'Decide employee', description: 'Compare skipping, buying at full price, and buying at the discount.' },
    { id: 'done', label: 'Complete', description: 'Report the best profit for the top boss.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Hierarchy as JSON: n, present, future, hierarchy, budget',
  url: 'https://leetcode.com/problems/maximum-profit-from-trading-stocks-with-discounts/',
  complexity: 'O(n * budget^2) time for the tree knapsack merges. The visualization caps the company at 10 employees.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"present":[1,2],"future":[4,3],"hierarchy":[[1,2]],"budget":3}' },
    { label: 'Example 2', input: '{"n":2,"present":[3,4],"future":[5,8],"hierarchy":[[1,2]],"budget":4}' },
  ],
}

export default function MaximumProfitWithDiscounts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    run.input.present.forEach((price, id) => { tags[id] = `${price}/${run.input.future[id]}` })
    return <>
      <GraphTraversalView title="Hierarchy (tag: present/future price)" n={run.input.n} edges={run.edges} directed
        current={step.node} done={step.done} tags={tags} />
      <table aria-label="Best profit per employee at the full budget">
        <thead><tr><th>Employee</th><th>Boss did not buy</th><th>Boss bought</th></tr></thead>
        <tbody>{Object.entries(step.table).map(([id, row]) => (
          <tr key={id}><td>{Number(id) + 1}</td><td>{row.noBoss}</td><td>{row.bossBought}</td></tr>
        ))}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p>An employee's stock is cheaper when the direct boss buys, so every employee needs two answers: one for each choice the boss can make.</p>
    <p>Children are merged into each choice with a budget knapsack, and the two tables for each employee are then built from the merged results.</p>
  </>} />
}
