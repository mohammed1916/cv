import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? '')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with prices (product_id, start_date, end_date, price) and units_sold (product_id, purchase_date, units)',
  url: 'https://leetcode.com/problems/average-selling-price/',
  complexity: 'O(P + S) work after matching each sale to its price range, where P and S are the row counts. The visualization caps each list at 12 rows.',
  examples: [
    { label: 'Two products', input: '{"prices":[{"product_id":1,"start_date":"2019-02-17","end_date":"2019-02-28","price":5},{"product_id":1,"start_date":"2019-03-01","end_date":"2019-03-22","price":20},{"product_id":2,"start_date":"2019-02-01","end_date":"2019-02-20","price":15},{"product_id":2,"start_date":"2019-02-21","end_date":"2019-03-31","price":30},{"product_id":3,"start_date":"2019-01-01","end_date":"2019-12-31","price":99}],"units_sold":[{"product_id":1,"purchase_date":"2019-02-25","units":100},{"product_id":1,"purchase_date":"2019-03-01","units":15},{"product_id":2,"purchase_date":"2019-02-10","units":200},{"product_id":2,"purchase_date":"2019-02-28","units":30}]}' },
    { label: 'Boundary days', input: '{"prices":[{"product_id":4,"start_date":"2020-01-01","end_date":"2020-01-01","price":7}],"units_sold":[{"product_id":4,"purchase_date":"2020-01-01","units":3}]}' },
  ],
}

export default function AverageSellingPrice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>A sale belongs to the single price range whose inclusive dates contain its purchase date. Its revenue is that price times its units.</p>
    <p>The average is total revenue over total units, not an average of the prices. Products with no sales report zero.</p>
  </>} />
}
