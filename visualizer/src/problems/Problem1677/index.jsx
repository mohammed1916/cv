import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with Product and Invoice lists"
const EXAMPLE = "{\"Product\":[{\"product_id\":1,\"name\":\"Kettle\"},{\"product_id\":2,\"name\":\"Lamp\"},{\"product_id\":3,\"name\":\"Apron\"}],\"Invoice\":[{\"invoice_id\":1,\"product_id\":1,\"rest\":12,\"paid\":26,\"canceled\":14,\"refunded\":18},{\"invoice_id\":2,\"product_id\":1,\"rest\":22,\"paid\":38,\"canceled\":28,\"refunded\":12},{\"invoice_id\":3,\"product_id\":2,\"rest\":18,\"paid\":44,\"canceled\":22,\"refunded\":16}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["A left join keeps products with no invoices, and coalescing turns their empty sums into zero.","Totals are per product, so the outer table decides which rows exist and the invoice table only adds amounts."]

const definition = {
  number: '1677',
  title: "Product's Worth Over Invoices",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE }, { label: 'One product, no invoices', input: '{"Product":[{"product_id":1,"name":"Pen"}],"Invoice":[]}' }, { label: 'Equal invoices', input: '{"Product":[{"product_id":1,"name":"Pen"}],"Invoice":[{"invoice_id":1,"product_id":1,"rest":10,"paid":10,"canceled":0,"refunded":0},{"invoice_id":2,"product_id":1,"rest":10,"paid":10,"canceled":0,"refunded":0}]}' }, { label: 'All zero amounts', input: '{"Product":[{"product_id":1,"name":"Pen"}],"Invoice":[{"invoice_id":1,"product_id":1,"rest":0,"paid":0,"canceled":0,"refunded":0}]}' }, { label: 'Long run: 8 products, 12 invoices', input: '{"Product":[{"product_id":1,"name":"Item 1"},{"product_id":2,"name":"Item 2"},{"product_id":3,"name":"Item 3"},{"product_id":4,"name":"Item 4"},{"product_id":5,"name":"Item 5"},{"product_id":6,"name":"Item 6"},{"product_id":7,"name":"Item 7"},{"product_id":8,"name":"Item 8"}],"Invoice":[{"invoice_id":1,"product_id":4,"rest":255,"paid":189,"canceled":381,"refunded":306},{"invoice_id":2,"product_id":7,"rest":10,"paid":279,"canceled":302,"refunded":50},{"invoice_id":3,"product_id":3,"rest":196,"paid":167,"canceled":105,"refunded":465},{"invoice_id":4,"product_id":5,"rest":322,"paid":105,"canceled":108,"refunded":305},{"invoice_id":5,"product_id":6,"rest":21,"paid":62,"canceled":265,"refunded":170},{"invoice_id":6,"product_id":3,"rest":431,"paid":139,"canceled":388,"refunded":134},{"invoice_id":7,"product_id":4,"rest":359,"paid":200,"canceled":375,"refunded":23},{"invoice_id":8,"product_id":7,"rest":389,"paid":256,"canceled":70,"refunded":462},{"invoice_id":9,"product_id":8,"rest":182,"paid":444,"canceled":157,"refunded":162},{"invoice_id":10,"product_id":1,"rest":9,"paid":451,"canceled":346,"refunded":33},{"invoice_id":11,"product_id":7,"rest":198,"paid":64,"canceled":424,"refunded":381},{"invoice_id":12,"product_id":5,"rest":7,"paid":414,"canceled":141,"refunded":408}]}' }],
}

const formatValue = value => value === undefined || value === null ? '' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)

function RowTable({ label, rows }) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  return <section aria-label={label}>
    <h4>{label}</h4>
    {rows.length === 0 ? <p>No rows yet.</p> : <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}</tbody>
    </table>}
  </section>
}

export default function Problem1677() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
