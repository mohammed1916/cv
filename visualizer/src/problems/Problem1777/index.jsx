import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of Products rows'
const complexity = 'One pass over the rows with one output row per product. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"product_id":7,"store":"store1","price":120},{"product_id":7,"store":"store3","price":135},{"product_id":8,"store":"store2","price":64},{"product_id":9,"store":"store1","price":88},{"product_id":9,"store":"store2","price":91},{"product_id":9,"store":"store3","price":97}]',
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
  </>} renderReasoning={() => <p>Each store becomes its own column. A store with no row for a product leaves that cell empty, which the query shows as NULL.</p>} />
}
