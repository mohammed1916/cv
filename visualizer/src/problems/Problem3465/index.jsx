import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function Grid({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={cell}>{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={cell}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'JSON object with a products list (product_id, product_name, description)',
  url: 'https://leetcode.com/problems/find-products-with-valid-serial-numbers/description/',
  complexity: 'O(n) scans for n products. The serial shape is a knowledge-derived teaching pattern, not the official one.',
  examples: [
    { label: 'Example', input: '{"products":[{"product_id":1,"product_name":"Lamp","description":"Warm light, serial SN-2024-AB inside"},{"product_id":2,"product_name":"Desk","description":"Old model SN-2024-ABC"},{"product_id":3,"product_name":"Chair","description":"Spare part SN-1234-XY."},{"product_id":4,"product_name":"Shelf","description":"Reference xSN-1234-XY"}]}' },
    { label: 'No match', input: '{"products":[{"product_id":7,"product_name":"Rug","description":"No serial here"}]}' },
  ],
}

export default function Problem3465() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {Object.entries(run.input).map(([name, rows]) => <section key={name}><h3>{name} (input)</h3><Grid rows={rows} /></section>)}
    <section><h3>Kept so far</h3><Grid rows={step.rows} /></section>
    <output aria-label="Result">{`Products returned: ${run.result.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A description qualifies only when the serial stands alone: the characters just before SN and just after the two letters must not be letters or digits.</p>
    <p>Each product is scanned once, and the kept rows are returned in product_id order.</p>
  </>} />
}
