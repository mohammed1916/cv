import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with customers, orders and products lists"
const EXAMPLE = "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"},{\"customer_id\":2,\"name\":\"Ben\"},{\"customer_id\":3,\"name\":\"Cy\"}],\"products\":[{\"product_id\":10,\"product_name\":\"Keyboard\",\"price\":30},{\"product_id\":20,\"product_name\":\"Mouse\",\"price\":12},{\"product_id\":30,\"product_name\":\"Dock\",\"price\":80}],\"orders\":[{\"order_id\":1,\"order_date\":\"2020-01-01\",\"customer_id\":1,\"product_id\":10},{\"order_id\":2,\"order_date\":\"2020-01-05\",\"customer_id\":1,\"product_id\":10},{\"order_id\":3,\"order_date\":\"2020-01-09\",\"customer_id\":1,\"product_id\":20},{\"order_id\":4,\"order_date\":\"2020-02-01\",\"customer_id\":1,\"product_id\":20},{\"order_id\":5,\"order_date\":\"2020-02-02\",\"customer_id\":2,\"product_id\":30},{\"order_id\":6,\"order_date\":\"2020-02-03\",\"customer_id\":2,\"product_id\":10},{\"order_id\":7,\"order_date\":\"2020-02-04\",\"customer_id\":3,\"product_id\":20}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["Counting happens per customer and product pair; the maximum is taken within each customer.","Comparing each pair with its customer’s maximum keeps every tie instead of picking one winner."]

const definition = {
  number: '1596',
  title: "The Most Frequently Ordered Products for Each Customer",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE },
    { label: "Single order", input: "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"}],\"products\":[{\"product_id\":10,\"product_name\":\"P1\",\"price\":5}],\"orders\":[{\"order_id\":1,\"order_date\":\"2020-03-01\",\"customer_id\":1,\"product_id\":10}]}" },
    { label: "Tie for the top product", input: "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"}],\"products\":[{\"product_id\":10,\"product_name\":\"P1\",\"price\":5},{\"product_id\":20,\"product_name\":\"P2\",\"price\":6}],\"orders\":[{\"order_id\":1,\"order_date\":\"2020-03-01\",\"customer_id\":1,\"product_id\":10},{\"order_id\":2,\"order_date\":\"2020-03-02\",\"customer_id\":1,\"product_id\":20}]}" },
    { label: "Sixteen orders, one customer", input: "{\"customers\":[{\"customer_id\":1,\"name\":\"Ana\"}],\"products\":[{\"product_id\":10,\"product_name\":\"P1\",\"price\":5},{\"product_id\":20,\"product_name\":\"P2\",\"price\":6},{\"product_id\":30,\"product_name\":\"P3\",\"price\":7},{\"product_id\":40,\"product_name\":\"P4\",\"price\":8}],\"orders\":[{\"order_id\":1,\"order_date\":\"2020-04-01\",\"customer_id\":1,\"product_id\":10},{\"order_id\":2,\"order_date\":\"2020-04-02\",\"customer_id\":1,\"product_id\":20},{\"order_id\":3,\"order_date\":\"2020-04-03\",\"customer_id\":1,\"product_id\":30},{\"order_id\":4,\"order_date\":\"2020-04-04\",\"customer_id\":1,\"product_id\":40},{\"order_id\":5,\"order_date\":\"2020-04-05\",\"customer_id\":1,\"product_id\":10},{\"order_id\":6,\"order_date\":\"2020-04-06\",\"customer_id\":1,\"product_id\":20},{\"order_id\":7,\"order_date\":\"2020-04-07\",\"customer_id\":1,\"product_id\":30},{\"order_id\":8,\"order_date\":\"2020-04-08\",\"customer_id\":1,\"product_id\":40},{\"order_id\":9,\"order_date\":\"2020-04-09\",\"customer_id\":1,\"product_id\":10},{\"order_id\":10,\"order_date\":\"2020-04-10\",\"customer_id\":1,\"product_id\":20},{\"order_id\":11,\"order_date\":\"2020-04-11\",\"customer_id\":1,\"product_id\":30},{\"order_id\":12,\"order_date\":\"2020-04-12\",\"customer_id\":1,\"product_id\":40},{\"order_id\":13,\"order_date\":\"2020-04-13\",\"customer_id\":1,\"product_id\":10},{\"order_id\":14,\"order_date\":\"2020-04-14\",\"customer_id\":1,\"product_id\":20},{\"order_id\":15,\"order_date\":\"2020-04-15\",\"customer_id\":1,\"product_id\":30},{\"order_id\":16,\"order_date\":\"2020-04-16\",\"customer_id\":1,\"product_id\":40}]}" },
    { label: "Long run: 8 products, 16 orders", input: "{\"customers\":[{\"customer_id\":1,\"name\":\"C1\"},{\"customer_id\":2,\"name\":\"C2\"},{\"customer_id\":3,\"name\":\"C3\"},{\"customer_id\":4,\"name\":\"C4\"},{\"customer_id\":5,\"name\":\"C5\"},{\"customer_id\":6,\"name\":\"C6\"}],\"products\":[{\"product_id\":10,\"product_name\":\"P1\",\"price\":5},{\"product_id\":20,\"product_name\":\"P2\",\"price\":6},{\"product_id\":30,\"product_name\":\"P3\",\"price\":7},{\"product_id\":40,\"product_name\":\"P4\",\"price\":8},{\"product_id\":50,\"product_name\":\"P5\",\"price\":9},{\"product_id\":60,\"product_name\":\"P6\",\"price\":10},{\"product_id\":70,\"product_name\":\"P7\",\"price\":11},{\"product_id\":80,\"product_name\":\"P8\",\"price\":12}],\"orders\":[{\"order_id\":100,\"order_date\":\"2020-05-01\",\"customer_id\":3,\"product_id\":10},{\"order_id\":101,\"order_date\":\"2020-05-02\",\"customer_id\":5,\"product_id\":60},{\"order_id\":102,\"order_date\":\"2020-05-03\",\"customer_id\":3,\"product_id\":60},{\"order_id\":103,\"order_date\":\"2020-05-04\",\"customer_id\":2,\"product_id\":70},{\"order_id\":104,\"order_date\":\"2020-05-05\",\"customer_id\":1,\"product_id\":30},{\"order_id\":105,\"order_date\":\"2020-05-06\",\"customer_id\":5,\"product_id\":10},{\"order_id\":106,\"order_date\":\"2020-05-07\",\"customer_id\":2,\"product_id\":10},{\"order_id\":107,\"order_date\":\"2020-05-08\",\"customer_id\":4,\"product_id\":70},{\"order_id\":108,\"order_date\":\"2020-05-09\",\"customer_id\":3,\"product_id\":70},{\"order_id\":109,\"order_date\":\"2020-05-10\",\"customer_id\":1,\"product_id\":20},{\"order_id\":110,\"order_date\":\"2020-05-11\",\"customer_id\":4,\"product_id\":40},{\"order_id\":111,\"order_date\":\"2020-05-12\",\"customer_id\":4,\"product_id\":40},{\"order_id\":112,\"order_date\":\"2020-05-13\",\"customer_id\":1,\"product_id\":80},{\"order_id\":113,\"order_date\":\"2020-05-14\",\"customer_id\":2,\"product_id\":60},{\"order_id\":114,\"order_date\":\"2020-05-15\",\"customer_id\":6,\"product_id\":30},{\"order_id\":115,\"order_date\":\"2020-05-16\",\"customer_id\":4,\"product_id\":30}]}" }],
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

function CountBars({ rows }) {
  if (rows.length === 0 || !('best_count' in rows[0])) return null
  const max = Math.max(1, ...rows.map(row => row.order_count))
  return <section aria-label="Orders per customer and product">
    <h4>Orders per product, against each customer's best</h4>
    {rows.map(row => {
      const tied = row.order_count === row.best_count
      return <div key={`${row.customer_id}-${row.product_id}`} style={{ display: 'grid', gridTemplateColumns: '9rem 1fr 4rem', gap: 8, alignItems: 'center', marginBottom: 4, color: 'var(--text)' }}>
        <span style={{ fontFamily: 'monospace' }}>customer {row.customer_id} · product {row.product_id}</span>
        <div style={{ position: 'relative', background: 'var(--surface2)', borderRadius: 4, height: 14 }}>
          <div style={{ width: `${(row.order_count / max) * 100}%`, height: '100%', borderRadius: 4, background: tied ? 'var(--primary)' : 'var(--text-muted)' }} />
        </div>
        <strong>{row.order_count}{tied ? ' (best)' : ''}</strong>
      </div>
    })}
    <p style={{ color: 'var(--text-muted)' }}>Purple bars reach their customer's largest count, so every tie is kept.</p>
  </section>
}

export default function Problem1596() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <CountBars rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
