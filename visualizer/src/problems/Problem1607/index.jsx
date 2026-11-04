import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with customer, seller and orders lists"
const EXAMPLE = "{\"customer\":[{\"customer_id\":1,\"customer_name\":\"Noor\"}],\"seller\":[{\"seller_id\":1,\"seller_name\":\"Ilse\"},{\"seller_id\":2,\"seller_name\":\"Jun\"},{\"seller_id\":3,\"seller_name\":\"Kofi\"},{\"seller_id\":4,\"seller_name\":\"Mira\"}],\"orders\":[{\"order_id\":1,\"sale_date\":\"2020-03-01\",\"order_cost\":1000,\"customer_id\":1,\"seller_id\":2},{\"order_id\":2,\"sale_date\":\"2019-12-30\",\"order_cost\":500,\"customer_id\":1,\"seller_id\":1},{\"order_id\":3,\"sale_date\":\"2021-01-03\",\"order_cost\":300,\"customer_id\":1,\"seller_id\":3}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The test is about one calendar year, so the year is extracted before any seller is judged.","A not-exists check finds sellers whose only sales fall outside 2020, and sellers with no sales at all."]

const definition = {
  number: '1607',
  title: "Sellers With No Sales",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE }],
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

function SellerChips({ rows }) {
  if (rows.length === 0 || !('orders_2020' in rows[0])) return null
  return <section aria-label="2020 sales per seller">
    <h4>2020 orders per seller</h4>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {rows.map(row => <span key={row.seller_id} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace',
        background: row.orders_2020 === 0 ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface2)' }}>
        {row.seller_name}: {row.orders_2020} {row.orders_2020 === 0 ? '(idle, kept)' : '(sold in 2020)'}
      </span>)}
    </div>
  </section>
}

export default function Problem1607() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <SellerChips rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
