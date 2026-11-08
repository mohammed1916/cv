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
    { label: 'Single order', input: '[["Ana","1","Soup"]]' },
    { label: 'Same table, repeated food', input: '[["Ana","2","Soup"],["Ben","2","Bread"],["Cy","2","Bread"]]' },
    { label: 'Largest table number', input: '[["Ana","999","Pie"],["Ben","1","Pie"]]' },
    { label: 'Long run: 60 orders', input: '[["C0","19","Bread"],["C1","2","Salad"],["C2","19","Salad"],["C3","11","Pie"],["C4","13","Soup"],["C5","15","Soup"],["C6","2","Soup"],["C7","7","Pie"],["C8","17","Bread"],["C9","9","Pie"],["C10","17","Salad"],["C11","12","Bread"],["C12","3","Salad"],["C13","13","Bread"],["C14","9","Salad"],["C15","3","Pie"],["C16","7","Bread"],["C17","1","Soup"],["C18","11","Pie"],["C19","20","Bread"],["C20","2","Salad"],["C21","7","Soup"],["C22","16","Soup"],["C23","16","Salad"],["C24","8","Bread"],["C25","2","Soup"],["C26","12","Soup"],["C27","4","Soup"],["C28","4","Salad"],["C29","1","Soup"],["C30","14","Bread"],["C31","12","Salad"],["C32","15","Salad"],["C33","16","Salad"],["C34","16","Pie"],["C35","6","Pie"],["C36","4","Bread"],["C37","18","Soup"],["C38","11","Pie"],["C39","6","Bread"],["C40","8","Bread"],["C41","18","Pie"],["C42","16","Salad"],["C43","6","Pie"],["C44","16","Soup"],["C45","12","Salad"],["C46","9","Pie"],["C47","15","Bread"],["C48","7","Pie"],["C49","17","Pie"],["C50","20","Bread"],["C51","4","Bread"],["C52","13","Bread"],["C53","3","Bread"],["C54","16","Pie"],["C55","14","Pie"],["C56","4","Salad"],["C57","20","Salad"],["C58","10","Salad"],["C59","2","Salad"]]' },
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
