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
    { label: 'Single product', input: '{"products":[{"product_id":7,"product_name":"Pin","description":"No digits"}]}' },
    { label: 'Equal descriptions tie', input: '{"products":[{"product_id":1,"product_name":"Tag","description":"Size 12"},{"product_id":2,"product_name":"Tag","description":"Size 12"}]}' },
    { label: 'Longest description', input: '{"products":[{"product_id":3,"product_name":"Box","description":"Set 1, 2 and 3. Set 1, 2 and 3. Set 1, 2 and 3. Set 1, 2 and"}]}' },
    { label: 'Long run: 12 products', input: '{"products":[{"product_id":1,"product_name":"Item1","description":"Lot 42, batch 52"},{"product_id":2,"product_name":"Item2","description":"Lot 10, batch 41"},{"product_id":3,"product_name":"Item3","description":"Lot 85, batch 13"},{"product_id":4,"product_name":"Item4","description":"Lot 96, batch 48"},{"product_id":5,"product_name":"Item5","description":"Lot 7, batch 40"},{"product_id":6,"product_name":"Item6","description":"Lot 73, batch 58"},{"product_id":7,"product_name":"Item7","description":"Lot 63, batch 99"},{"product_id":8,"product_name":"Item8","description":"Lot 31, batch 83"},{"product_id":9,"product_name":"Item9","description":"Lot 75, batch 8"},{"product_id":10,"product_name":"Item10","description":"Lot 63, batch 95"},{"product_id":11,"product_name":"Item11","description":"Lot 48, batch 40"},{"product_id":12,"product_name":"Item12","description":"Lot 78, batch 48"}]}' },
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
