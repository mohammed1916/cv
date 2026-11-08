import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Transactions":[{"transaction_id":1,"day":"2020-11-03 09:00:00","amount":500},{"transaction_id":2,"day":"2020-11-03 18:00:00","amount":900},{"transaction_id":3,"day":"2020-11-03 12:00:00","amount":900},{"transaction_id":4,"day":"2020-11-04 08:00:00","amount":200},{"transaction_id":5,"day":"2020-11-04 21:00:00","amount":150},{"transaction_id":6,"day":"2020-11-05 10:00:00","amount":75}]}',
}, { label: 'Single transaction', input: "{\"Transactions\":[{\"transaction_id\":1,\"day\":\"2020-01-01 10:00:00\",\"amount\":100}]}" }, { label: 'Identical rows', input: "{\"Transactions\":[{\"transaction_id\":1,\"day\":\"2020-02-02 08:00:00\",\"amount\":300},{\"transaction_id\":2,\"day\":\"2020-02-02 08:00:00\",\"amount\":300}]}" }, { label: 'Same day, different times', input: "{\"Transactions\":[{\"transaction_id\":1,\"day\":\"2020-03-01 23:59:59\",\"amount\":1},{\"transaction_id\":2,\"day\":\"2020-03-01 00:00:00\",\"amount\":2}]}" }, { label: 'Long run: 12 transactions', input: "{\"Transactions\":[{\"transaction_id\":1,\"day\":\"2020-04-03 11:14:02\",\"amount\":204},{\"transaction_id\":2,\"day\":\"2020-04-02 03:28:59\",\"amount\":846},{\"transaction_id\":3,\"day\":\"2020-04-01 03:50:55\",\"amount\":925},{\"transaction_id\":4,\"day\":\"2020-04-01 20:13:28\",\"amount\":935},{\"transaction_id\":5,\"day\":\"2020-04-02 03:16:11\",\"amount\":872},{\"transaction_id\":6,\"day\":\"2020-04-02 13:49:57\",\"amount\":960},{\"transaction_id\":7,\"day\":\"2020-04-01 13:42:44\",\"amount\":354},{\"transaction_id\":8,\"day\":\"2020-04-01 17:01:33\",\"amount\":950},{\"transaction_id\":9,\"day\":\"2020-04-02 10:17:59\",\"amount\":501},{\"transaction_id\":10,\"day\":\"2020-04-03 21:45:40\",\"amount\":495},{\"transaction_id\":11,\"day\":\"2020-04-03 18:18:14\",\"amount\":198},{\"transaction_id\":12,\"day\":\"2020-04-02 03:30:04\",\"amount\":778}]}" }]

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
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Time of day is ignored: the calendar date is the grouping key, so 09:00 and 18:00 on the same day compete for one maximum.</p>
    <p>Ties matter. Every transaction that equals its day maximum is kept, which is why 2020-11-03 contributes two rows.</p>
  </>} />
}
