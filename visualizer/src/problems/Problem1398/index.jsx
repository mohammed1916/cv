import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'Customers and purchases (JSON)'
const complexity = 'Time grows with the number of purchase rows.'
const examples = [
  { label: 'Needs A and B', input: '{"Customers":[{"customer_id":1,"customer_name":"Ivy"},{"customer_id":2,"customer_name":"Jun"},{"customer_id":3,"customer_name":"Kai"}],"Orders":[{"order_id":1,"customer_id":1,"product_name":"A"},{"order_id":2,"customer_id":1,"product_name":"B"},{"order_id":3,"customer_id":2,"product_name":"A"},{"order_id":4,"customer_id":2,"product_name":"B"},{"order_id":5,"customer_id":2,"product_name":"C"},{"order_id":6,"customer_id":3,"product_name":"B"}]}' },
  { label: 'Only one product', input: '{"Customers":[{"customer_id":4,"customer_name":"Lia"}],"Orders":[{"order_id":7,"customer_id":4,"product_name":"A"}]}' },
  { label: "One customer, no orders", input: "{\"Customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\"}],\"Orders\":[]}" },
  { label: "Equal rows keep id order", input: "{\"Customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\"},{\"customer_id\":2,\"customer_name\":\"Bo\"}],\"Orders\":[{\"order_id\":1,\"customer_id\":2,\"product_name\":\"B\"},{\"order_id\":2,\"customer_id\":2,\"product_name\":\"A\"},{\"order_id\":3,\"customer_id\":1,\"product_name\":\"A\"},{\"order_id\":4,\"customer_id\":1,\"product_name\":\"B\"}]}" },
  { label: "Eight customers, twelve orders", input: "{\"Customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\"},{\"customer_id\":2,\"customer_name\":\"Bo\"},{\"customer_id\":3,\"customer_name\":\"Cy\"},{\"customer_id\":4,\"customer_name\":\"Dee\"},{\"customer_id\":5,\"customer_name\":\"Eli\"},{\"customer_id\":6,\"customer_name\":\"Fay\"},{\"customer_id\":7,\"customer_name\":\"Gus\"},{\"customer_id\":8,\"customer_name\":\"Hal\"}],\"Orders\":[{\"order_id\":100,\"customer_id\":1,\"product_name\":\"A\"},{\"order_id\":101,\"customer_id\":2,\"product_name\":\"B\"},{\"order_id\":102,\"customer_id\":3,\"product_name\":\"C\"},{\"order_id\":103,\"customer_id\":4,\"product_name\":\"A\"},{\"order_id\":104,\"customer_id\":5,\"product_name\":\"A\"},{\"order_id\":105,\"customer_id\":6,\"product_name\":\"B\"},{\"order_id\":106,\"customer_id\":7,\"product_name\":\"C\"},{\"order_id\":107,\"customer_id\":8,\"product_name\":\"A\"},{\"order_id\":108,\"customer_id\":1,\"product_name\":\"A\"},{\"order_id\":109,\"customer_id\":2,\"product_name\":\"B\"},{\"order_id\":110,\"customer_id\":3,\"product_name\":\"C\"},{\"order_id\":111,\"customer_id\":4,\"product_name\":\"A\"}]}" },
  { label: "Long run: eight customers, random orders", input: "{\"Customers\":[{\"customer_id\":1,\"customer_name\":\"Ana\"},{\"customer_id\":2,\"customer_name\":\"Bo\"},{\"customer_id\":3,\"customer_name\":\"Cy\"},{\"customer_id\":4,\"customer_name\":\"Dee\"},{\"customer_id\":5,\"customer_name\":\"Eli\"},{\"customer_id\":6,\"customer_name\":\"Fay\"},{\"customer_id\":7,\"customer_name\":\"Gus\"},{\"customer_id\":8,\"customer_name\":\"Hal\"}],\"Orders\":[{\"order_id\":100,\"customer_id\":7,\"product_name\":\"A\"},{\"order_id\":101,\"customer_id\":1,\"product_name\":\"B\"},{\"order_id\":102,\"customer_id\":1,\"product_name\":\"D\"},{\"order_id\":103,\"customer_id\":8,\"product_name\":\"B\"},{\"order_id\":104,\"customer_id\":6,\"product_name\":\"D\"},{\"order_id\":105,\"customer_id\":1,\"product_name\":\"A\"},{\"order_id\":106,\"customer_id\":3,\"product_name\":\"C\"},{\"order_id\":107,\"customer_id\":2,\"product_name\":\"A\"},{\"order_id\":108,\"customer_id\":7,\"product_name\":\"C\"},{\"order_id\":109,\"customer_id\":7,\"product_name\":\"B\"},{\"order_id\":110,\"customer_id\":6,\"product_name\":\"B\"},{\"order_id\":111,\"customer_id\":4,\"product_name\":\"B\"}]}" },
]
const reasoning = ['Customers are grouped once, and each product is checked with a conditional count.', 'Only customers whose counts meet all three rules are kept.']

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }


// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows whose content changed since the previous stage are marked "new".

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'left', color: 'var(--text)' }

// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows that were not in the previous stage are marked "new".
function StageTable({ run, step, phases }) {
  const view = step.view || {}
  const caption = view.caption || step.caption || 'Current rows'
  const rows = view.rows || step.rows || []
  const columns = view.columns || step.columns || (rows[0] ? Object.keys(rows[0]) : [])
  const index = run.frames.indexOf(step)
  const prior = index > 0 ? run.frames[index - 1] : null
  const previous = prior ? (prior.view?.rows || prior.rows || []) : []
  const seen = new Set(previous.map(row => JSON.stringify(row)))
  return <section aria-label="Current table">
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{phases.map(p => <span key={p.id} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: p.id === step.phase ? 'var(--primary)' : 'var(--surface2)', color: p.id === step.phase ? '#fff' : 'var(--text)' }}>{p.label}</span>)}</div>
    <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>{caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, color: 'var(--text)' }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}<th style={cell}>change</th></tr></thead>
      <tbody>{rows.length
        ? rows.map((row, i) => {
          const isNew = !seen.has(JSON.stringify(row))
          return <tr key={i} style={{ background: isNew ? 'var(--surface2)' : 'transparent' }}>
            {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
            <td style={cell}>{isNew ? 'new' : ''}</td>
          </tr>
        })
        : <tr><td style={cell} colSpan={columns.length + 1}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <StageTable run={run} step={step} phases={definition.phases} />}
    renderReasoning={() => reasoning.map(text => <p key={text}>{text}</p>)} />
}
