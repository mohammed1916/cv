import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, sampleText } from './algorithm'

const inputLabel = 'Invented sample tables'
const complexity = 'Each table is capped at 12 rows in this visualizer. The trace does one pass per table plus the final output.'
const examples = [{ label: 'Sample', input: sampleText }, { label: "Single order", input: "{\"Orders\":[{\"order_id\":1,\"customer_id\":1,\"order_type\":1}]}" }, { label: "Same customer same type", input: "{\"Orders\":[{\"order_id\":1,\"customer_id\":1,\"order_type\":0},{\"order_id\":2,\"customer_id\":1,\"order_type\":0}]}" }, { label: "All type one", input: "{\"Orders\":[{\"order_id\":1,\"customer_id\":1,\"order_type\":1},{\"order_id\":2,\"customer_id\":2,\"order_type\":1},{\"order_id\":3,\"customer_id\":3,\"order_type\":1},{\"order_id\":4,\"customer_id\":4,\"order_type\":1},{\"order_id\":5,\"customer_id\":5,\"order_type\":1},{\"order_id\":6,\"customer_id\":6,\"order_type\":1},{\"order_id\":7,\"customer_id\":7,\"order_type\":1},{\"order_id\":8,\"customer_id\":8,\"order_type\":1},{\"order_id\":9,\"customer_id\":9,\"order_type\":1},{\"order_id\":10,\"customer_id\":10,\"order_type\":1},{\"order_id\":11,\"customer_id\":11,\"order_type\":1},{\"order_id\":12,\"customer_id\":12,\"order_type\":1}]}" }, { label: "Long run: 12 orders", input: "{\"Orders\":[{\"order_id\":1,\"customer_id\":4,\"order_type\":1},{\"order_id\":2,\"customer_id\":1,\"order_type\":1},{\"order_id\":3,\"customer_id\":3,\"order_type\":0},{\"order_id\":4,\"customer_id\":3,\"order_type\":1},{\"order_id\":5,\"customer_id\":5,\"order_type\":0},{\"order_id\":6,\"customer_id\":3,\"order_type\":1},{\"order_id\":7,\"customer_id\":5,\"order_type\":0},{\"order_id\":8,\"customer_id\":1,\"order_type\":1},{\"order_id\":9,\"customer_id\":4,\"order_type\":0},{\"order_id\":10,\"customer_id\":2,\"order_type\":1},{\"order_id\":11,\"customer_id\":3,\"order_type\":1},{\"order_id\":12,\"customer_id\":5,\"order_type\":1}]}" }]

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

function CustomerBand({ customers = [] }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', margin: '8px 0' }}>
    <span style={{ color: 'var(--text)' }}>Customers with a type-0 order:</span>
    {customers.length === 0
      ? <span style={{ color: 'var(--text)', opacity: 0.7 }}>none yet</span>
      : customers.map(id => <span key={id} style={{ padding: '2px 10px', borderRadius: 999, background: 'var(--primary)', color: 'var(--surface)' }}>customer {id}</span>)}
  </div>
}

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <CustomerBand customers={step.type0} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each step shows the rows the query holds at that moment. The band lists the customers who have a type-0 order: their type-1 orders are dropped, and every type-0 order is kept. The sample tables are invented for this walkthrough.</p>} />
}
