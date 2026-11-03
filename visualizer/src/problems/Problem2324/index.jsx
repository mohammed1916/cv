import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Sales and Product tables'
const complexity = 'O(n) to join and total the sales, then one pass over the totals. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Product":[{"product_id":1,"price":10},{"product_id":2,"price":5},{"product_id":3,"price":4}],"Sales":[{"sale_id":1,"product_id":1,"user_id":1,"quantity":2},{"sale_id":2,"product_id":2,"user_id":1,"quantity":4},{"sale_id":3,"product_id":3,"user_id":1,"quantity":1},{"sale_id":4,"product_id":2,"user_id":2,"quantity":1},{"sale_id":5,"product_id":1,"user_id":2,"quantity":1},{"sale_id":6,"product_id":1,"user_id":2,"quantity":1}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each sale is priced, totals are added per user and product, and each user keeps every product that matches the top total for that user.</p>} />
}
