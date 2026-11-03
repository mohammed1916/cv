import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Transactions":[{"transaction_id":1,"day":"2020-11-03 09:00:00","amount":500},{"transaction_id":2,"day":"2020-11-03 18:00:00","amount":900},{"transaction_id":3,"day":"2020-11-03 12:00:00","amount":900},{"transaction_id":4,"day":"2020-11-04 08:00:00","amount":200},{"transaction_id":5,"day":"2020-11-04 21:00:00","amount":150},{"transaction_id":6,"day":"2020-11-05 10:00:00","amount":75}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Transactions table (day as a date-time string)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n log n) for the sort, or O(n) with a per-day hash map of maxima. The visualizer caps the table at 12 rows.',
  examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function MaximumTransactionEachDayVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Time of day is ignored: the calendar date is the grouping key, so 09:00 and 18:00 on the same day compete for one maximum.</p>
    <p>Ties matter. Every transaction that equals its day maximum is kept, which is why 2020-11-03 contributes two rows.</p>
  </>} />
}
