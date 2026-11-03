import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON array of [customer, table, food] orders',
  url: 'https://leetcode.com/problems/display-table-of-food-orders-in-a-restaurant/',
  complexity: 'O(n log n) time for n orders, from sorting the distinct foods and tables; the table itself has one cell per table and food.',
  examples: [
    { label: 'Sample', input: JSON.stringify([['Ana', '3', 'Soup'], ['Ben', '1', 'Bread'], ['Cy', '3', 'Bread'], ['Dee', '10', 'Soup'], ['Eli', '1', 'Soup']]) },
    { label: 'Single table', input: JSON.stringify([['Ann', '5', 'Tea'], ['Bo', '5', 'Tea']]) },
  ],
}

function DisplayScene({ step }) {
  const { foods, tables, counts, current } = step.snapshot
  return <div className="algorithm-sequence">
    <table aria-label="Order counts by table and food">
      <thead><tr><th>Table</th>{foods.map(food => <th key={food}>{food}</th>)}</tr></thead>
      <tbody>{tables.map(table => <tr key={table}>
        <th>{table}</th>
        {foods.map(food => <td key={food}>{counts[table]?.[food] || 0}</td>)}
      </tr>)}</tbody>
    </table>
    <p>{current >= 0 ? `Order ${current + 1} is counted.` : 'Counts are shown as the algorithm reaches each table and food.'}</p>
  </div>
}

export default function DisplayTable() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <DisplayScene step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
