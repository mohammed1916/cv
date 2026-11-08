import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Transactions as JSON',
  url: 'https://leetcode.com/problems/customers-with-maximum-number-of-transactions-on-consecutive-days/',
  complexity: 'One pass to find the distinct days per customer, then streak grouping.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }, { label: 'Single transaction', input: '{"transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2026-06-15","amount":12}]}' }, { label: 'Tie: two customers share the longest streak', input: '{"transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2026-02-01","amount":4},{"transaction_id":2,"customer_id":1,"transaction_date":"2026-02-02","amount":4},{"transaction_id":3,"customer_id":2,"transaction_date":"2026-02-09","amount":3},{"transaction_id":4,"customer_id":2,"transaction_date":"2026-02-10","amount":3}]}' }, { label: 'Boundary: year and leap day streaks', input: '{"transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2026-12-31","amount":2},{"transaction_id":2,"customer_id":1,"transaction_date":"2027-01-01","amount":2},{"transaction_id":3,"customer_id":2,"transaction_date":"2028-02-28","amount":5},{"transaction_id":4,"customer_id":2,"transaction_date":"2028-02-29","amount":5},{"transaction_id":5,"customer_id":2,"transaction_date":"2028-03-01","amount":5}]}' }, { label: 'Long run: 60 transactions, 3 customers', input: '{"transactions":[{"transaction_id":1,"customer_id":1,"transaction_date":"2026-02-07","amount":14},{"transaction_id":2,"customer_id":3,"transaction_date":"2026-01-27","amount":10},{"transaction_id":3,"customer_id":2,"transaction_date":"2026-01-25","amount":20},{"transaction_id":4,"customer_id":1,"transaction_date":"2026-01-14","amount":16},{"transaction_id":5,"customer_id":3,"transaction_date":"2026-02-04","amount":10},{"transaction_id":6,"customer_id":2,"transaction_date":"2026-01-30","amount":5},{"transaction_id":7,"customer_id":2,"transaction_date":"2026-01-15","amount":16},{"transaction_id":8,"customer_id":2,"transaction_date":"2026-01-21","amount":19},{"transaction_id":9,"customer_id":2,"transaction_date":"2026-02-10","amount":11},{"transaction_id":10,"customer_id":3,"transaction_date":"2026-01-01","amount":6},{"transaction_id":11,"customer_id":1,"transaction_date":"2026-01-14","amount":2},{"transaction_id":12,"customer_id":3,"transaction_date":"2026-02-14","amount":5},{"transaction_id":13,"customer_id":1,"transaction_date":"2026-01-05","amount":4},{"transaction_id":14,"customer_id":1,"transaction_date":"2026-01-21","amount":13},{"transaction_id":15,"customer_id":1,"transaction_date":"2026-01-20","amount":20},{"transaction_id":16,"customer_id":2,"transaction_date":"2026-01-09","amount":3},{"transaction_id":17,"customer_id":1,"transaction_date":"2026-02-07","amount":10},{"transaction_id":18,"customer_id":1,"transaction_date":"2026-02-09","amount":8},{"transaction_id":19,"customer_id":1,"transaction_date":"2026-02-13","amount":15},{"transaction_id":20,"customer_id":1,"transaction_date":"2026-01-07","amount":7},{"transaction_id":21,"customer_id":1,"transaction_date":"2026-01-25","amount":15},{"transaction_id":22,"customer_id":3,"transaction_date":"2026-01-28","amount":15},{"transaction_id":23,"customer_id":3,"transaction_date":"2026-01-23","amount":14},{"transaction_id":24,"customer_id":2,"transaction_date":"2026-01-01","amount":16},{"transaction_id":25,"customer_id":1,"transaction_date":"2026-01-12","amount":10},{"transaction_id":26,"customer_id":3,"transaction_date":"2026-02-04","amount":19},{"transaction_id":27,"customer_id":1,"transaction_date":"2026-02-11","amount":12},{"transaction_id":28,"customer_id":1,"transaction_date":"2026-01-16","amount":6},{"transaction_id":29,"customer_id":1,"transaction_date":"2026-01-20","amount":17},{"transaction_id":30,"customer_id":2,"transaction_date":"2026-01-27","amount":19},{"transaction_id":31,"customer_id":1,"transaction_date":"2026-02-09","amount":16},{"transaction_id":32,"customer_id":2,"transaction_date":"2026-01-21","amount":18},{"transaction_id":33,"customer_id":3,"transaction_date":"2026-01-04","amount":10},{"transaction_id":34,"customer_id":2,"transaction_date":"2026-01-04","amount":20},{"transaction_id":35,"customer_id":1,"transaction_date":"2026-01-19","amount":16},{"transaction_id":36,"customer_id":1,"transaction_date":"2026-01-13","amount":11},{"transaction_id":37,"customer_id":1,"transaction_date":"2026-01-14","amount":6},{"transaction_id":38,"customer_id":1,"transaction_date":"2026-01-13","amount":13},{"transaction_id":39,"customer_id":1,"transaction_date":"2026-02-10","amount":13},{"transaction_id":40,"customer_id":1,"transaction_date":"2026-01-07","amount":19},{"transaction_id":41,"customer_id":1,"transaction_date":"2026-01-01","amount":8},{"transaction_id":42,"customer_id":3,"transaction_date":"2026-02-06","amount":13},{"transaction_id":43,"customer_id":1,"transaction_date":"2026-01-22","amount":9},{"transaction_id":44,"customer_id":2,"transaction_date":"2026-02-08","amount":4},{"transaction_id":45,"customer_id":3,"transaction_date":"2026-01-02","amount":17},{"transaction_id":46,"customer_id":3,"transaction_date":"2026-01-10","amount":4},{"transaction_id":47,"customer_id":1,"transaction_date":"2026-02-05","amount":11},{"transaction_id":48,"customer_id":1,"transaction_date":"2026-01-21","amount":3},{"transaction_id":49,"customer_id":2,"transaction_date":"2026-02-12","amount":3},{"transaction_id":50,"customer_id":3,"transaction_date":"2026-01-03","amount":9},{"transaction_id":51,"customer_id":2,"transaction_date":"2026-01-21","amount":18},{"transaction_id":52,"customer_id":2,"transaction_date":"2026-02-07","amount":8},{"transaction_id":53,"customer_id":3,"transaction_date":"2026-01-09","amount":5},{"transaction_id":54,"customer_id":2,"transaction_date":"2026-01-16","amount":13},{"transaction_id":55,"customer_id":3,"transaction_date":"2026-01-17","amount":20},{"transaction_id":56,"customer_id":3,"transaction_date":"2026-01-10","amount":11},{"transaction_id":57,"customer_id":3,"transaction_date":"2026-01-15","amount":3},{"transaction_id":58,"customer_id":3,"transaction_date":"2026-01-11","amount":5},{"transaction_id":59,"customer_id":3,"transaction_date":"2026-01-10","amount":17},{"transaction_id":60,"customer_id":1,"transaction_date":"2026-02-05","amount":10}]}' } ],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function ConsecutiveDays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Each customer's distinct transaction days are grouped into runs of consecutive dates. The sample table is invented.</p>
    <p>Duplicate transactions on one day are collapsed first, so a day counts once.</p>
    <p>Subtracting the row number from the date keeps consecutive days on one shared key.</p>
  </>} />
}
