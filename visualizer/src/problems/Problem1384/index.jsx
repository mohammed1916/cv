import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'Products and sales periods (JSON)'
const complexity = 'Time grows with the number of calendar days covered by the periods.'
const examples = [
  { label: "One product, no sales", input: "{\"Product\":[{\"product_id\":1,\"product_name\":\"Pen\"}],\"Sales\":[]}" },
  { label: "Equal totals in one period", input: "{\"Product\":[{\"product_id\":1,\"product_name\":\"Pen\"},{\"product_id\":2,\"product_name\":\"Ink\"}],\"Sales\":[{\"product_id\":1,\"period_start\":\"2026-01-01\",\"period_end\":\"2026-01-10\",\"average_daily_sales\":5},{\"product_id\":2,\"period_start\":\"2026-01-01\",\"period_end\":\"2026-01-10\",\"average_daily_sales\":5}]}" },
  { label: "Sixty-day period", input: "{\"Product\":[{\"product_id\":1,\"product_name\":\"Pen\"}],\"Sales\":[{\"product_id\":1,\"period_start\":\"2026-01-01\",\"period_end\":\"2026-03-01\",\"average_daily_sales\":100}]}" },
  { label: "Long run: eight products, six periods", input: "{\"Product\":[{\"product_id\":1,\"product_name\":\"Pen\"},{\"product_id\":2,\"product_name\":\"Ink\"},{\"product_id\":3,\"product_name\":\"Cup\"},{\"product_id\":4,\"product_name\":\"Lamp\"},{\"product_id\":5,\"product_name\":\"Desk\"},{\"product_id\":6,\"product_name\":\"Mug\"},{\"product_id\":7,\"product_name\":\"Tray\"},{\"product_id\":8,\"product_name\":\"Clip\"}],\"Sales\":[{\"product_id\":7,\"period_start\":\"2026-01-01\",\"period_end\":\"2026-01-20\",\"average_daily_sales\":25},{\"product_id\":4,\"period_start\":\"2026-02-01\",\"period_end\":\"2026-02-10\",\"average_daily_sales\":27},{\"product_id\":7,\"period_start\":\"2026-03-01\",\"period_end\":\"2026-03-31\",\"average_daily_sales\":14},{\"product_id\":8,\"period_start\":\"2026-04-01\",\"period_end\":\"2026-04-15\",\"average_daily_sales\":18},{\"product_id\":5,\"period_start\":\"2026-05-01\",\"period_end\":\"2026-05-28\",\"average_daily_sales\":3},{\"product_id\":7,\"period_start\":\"2026-06-01\",\"period_end\":\"2026-06-30\",\"average_daily_sales\":16}]}" },
]
const reasoning = ['Each sales period is expanded into its calendar days, so leap years are counted through the date arithmetic rather than a fixed day count.', 'The days are then grouped by product and year, and the product name is attached last.']

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

// Plain table of the rows the query holds at this step.
function TableView({ view }) {
  return <section aria-label="Current table">
    <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{view.caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{view.columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{view.rows.length
        ? view.rows.map((row, index) => <tr key={index}>{view.columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}</tr>)
        : <tr><td style={cell} colSpan={view.columns.length}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <TableView view={step.view} />}
    renderReasoning={() => reasoning.map(text => <p key={text}>{text}</p>)} />
}
