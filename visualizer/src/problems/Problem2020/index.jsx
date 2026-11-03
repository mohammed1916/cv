import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Subscriptions and Streams tables'
const complexity = 'O(s + t) time for s subscriptions and t streams using sets. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Subscriptions":[{"account_id":1,"start_date":"2020-06-01","end_date":"2021-02-10"},{"account_id":2,"start_date":"2020-01-01","end_date":"2020-12-31"},{"account_id":3,"start_date":"2021-05-01","end_date":"2021-07-01"},{"account_id":3,"start_date":"2021-08-01","end_date":"2021-09-01"},{"account_id":4,"start_date":"2021-12-20","end_date":"2022-03-01"},{"account_id":5,"start_date":"2019-01-01","end_date":"2022-01-01"}],"Streams":[{"session_id":101,"account_id":1,"stream_date":"2021-03-05"},{"session_id":102,"account_id":4,"stream_date":"2020-11-11"},{"session_id":103,"account_id":5,"stream_date":"2021-01-01"},{"session_id":104,"account_id":2,"stream_date":"2020-03-03"}]}' },
  { label: 'Boundary dates', input: '{"Subscriptions":[{"account_id":7,"start_date":"2019-01-01","end_date":"2021-01-01"},{"account_id":8,"start_date":"2021-06-01","end_date":"2021-06-02"}],"Streams":[{"session_id":201,"account_id":8,"stream_date":"2021-12-31"}]}' },
]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function AccountsDidNotStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `accounts_count = ${run.result[0].accounts_count}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A subscription counts when its inclusive interval reaches into 2021, meaning it starts by 2021-12-31 and ends on or after 2021-01-01.</p>
    <p>The anti-join keeps an active account only when none of its streams falls in 2021. Several subscriptions for one account are counted once.</p>
  </>} />
}
