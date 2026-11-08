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
    { label: 'Own case 1', input: '{"n":2,"present":[2,1],"future":[3,4],"hierarchy":[[1,2]],"budget":3}' },
    { label: 'Own case 2', input: '{"n":2,"present":[4,3],"future":[8,5],"hierarchy":[[1,2]],"budget":4}' },
    { label: 'One employee', input: '{"n":1,"present":[5],"future":[9],"hierarchy":[],"budget":0}' },
    { label: 'Equal prices', input: '{"n":3,"present":[4,4,4],"future":[6,6,6],"hierarchy":[[1,2],[1,3]],"budget":5}' },
    { label: 'Largest values', input: '{"n":2,"present":[20,20],"future":[40,40],"hierarchy":[[1,2]],"budget":40}' },
    { label: 'Long run: 10 employees', input: '{"n":10,"present":[7,17,3,4,18,11,5,5,1,5],"future":[10,19,32,13,20,38,9,39,9,21],"hierarchy":[[1,2],[1,3],[1,4],[2,5],[4,6],[6,7],[1,8],[4,9],[9,10]],"budget":25}' },
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
