import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a products table (product_id, product_name, description)',
  url: 'https://leetcode.com/problems/find-products-with-three-consecutive-digits/description/',
  complexity: 'Teaching model: one pattern test per row. Visualization caps the table at 12 rows.',
  examples: [
    { label: 'Example', input: '{"products":[{"product_id":1,"product_name":"Pen","description":"Blue ink 123 pack"},{"product_id":2,"product_name":"Mug","description":"Holds 12 oz"},{"product_id":3,"product_name":"Card","description":"Code 9876"},{"product_id":4,"product_name":"Lamp","description":"Warm light, 2 bulbs"},{"product_id":5,"product_name":"Clip","description":"Batch 007"}]}' },
    { label: 'Two digits only', input: '{"products":[{"product_id":8,"product_name":"Tag","description":"Size 12"}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3415() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable rows={step.rows} columns={step.rows[0] && 'description' in step.rows[0] ? ['product_id', 'product_name', 'description'] : ['product_id', 'product_name']} />
    <output aria-label="Current state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A pattern of exactly three digit characters matches anywhere in the text, so the test does not need to know where the digits sit.</p>
    <p>A longer run such as 9876 contains several overlapping three-digit windows, so it qualifies once.</p>
  </>} />
}
