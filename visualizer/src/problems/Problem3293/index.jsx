import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Products":[{"product_id":1,"category":"food","price":1000},{"product_id":2,"category":"toys","price":250},{"product_id":3,"category":"food","price":333},{"product_id":4,"category":"books","price":999}],"Discounts":[{"category":"food","discount":10},{"category":"toys","discount":15}]}'
const halfUp = '{"Products":[{"product_id":8,"category":"toys","price":10}],"Discounts":[{"category":"toys","discount":25}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Products (product_id, category, price in whole units) and Discounts (category, discount 0 to 100)',
  url: 'https://leetcode.com/problems/calculate-product-final-price/description/',
  complexity: 'O(p + d) with a map of discounts. Each product is one multiplication and one division, with no rounding.',
  examples: [
    { label: 'Four products', input: sample },
    { label: 'Half unit', input: halfUp },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function CalculateProductFinalPrice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Products left-joined to discounts" columns={['product_id', 'category', 'discount', 'final']} rows={step.joined.map(r => ({ ...r, discount: r.discount ?? 'none (0)', final: r.final === null ? '-' : r.final.toFixed(2) }))} />
    <RowsTable caption="Final prices so far" columns={['product_id', 'final_price']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} product row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>A left join keeps every product. When a category has no discount row, COALESCE treats its discount as 0.</p>
    <p>Multiplying by (100 minus the discount) and dividing by 100 gives the exact final price.</p>
  </>} />
}
