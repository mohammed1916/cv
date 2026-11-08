import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Subscriptions and Streams tables'
const complexity = 'O(s + t) time for s subscriptions and t streams using sets. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Subscriptions":[{"account_id":1,"start_date":"2020-06-01","end_date":"2021-02-10"},{"account_id":2,"start_date":"2020-01-01","end_date":"2020-12-31"},{"account_id":3,"start_date":"2021-05-01","end_date":"2021-07-01"},{"account_id":3,"start_date":"2021-08-01","end_date":"2021-09-01"},{"account_id":4,"start_date":"2021-12-20","end_date":"2022-03-01"},{"account_id":5,"start_date":"2019-01-01","end_date":"2022-01-01"}],"Streams":[{"session_id":101,"account_id":1,"stream_date":"2021-03-05"},{"session_id":102,"account_id":4,"stream_date":"2020-11-11"},{"session_id":103,"account_id":5,"stream_date":"2021-01-01"},{"session_id":104,"account_id":2,"stream_date":"2020-03-03"}]}' },
  { label: 'Boundary dates', input: '{"Subscriptions":[{"account_id":7,"start_date":"2019-01-01","end_date":"2021-01-01"},{"account_id":8,"start_date":"2021-06-01","end_date":"2021-06-02"}],"Streams":[{"session_id":201,"account_id":8,"stream_date":"2021-12-31"}]}' },
  { label: "One subscription with no streams in range", input: "{\"Subscriptions\":[{\"account_id\":1,\"start_date\":\"2021-01-01\",\"end_date\":\"2021-12-31\"}],\"Streams\":[{\"session_id\":1,\"account_id\":2,\"stream_date\":\"2021-06-01\"}]}" },
  { label: "Overlapping duplicate subscriptions", input: "{\"Subscriptions\":[{\"account_id\":4,\"start_date\":\"2021-02-01\",\"end_date\":\"2021-03-01\"},{\"account_id\":4,\"start_date\":\"2021-02-01\",\"end_date\":\"2021-03-01\"}],\"Streams\":[{\"session_id\":2,\"account_id\":4,\"stream_date\":\"2021-02-15\"}]}" },
  { label: "Stream on the end date", input: "{\"Subscriptions\":[{\"account_id\":5,\"start_date\":\"2021-03-01\",\"end_date\":\"2021-03-31\"}],\"Streams\":[{\"session_id\":9,\"account_id\":5,\"stream_date\":\"2021-03-31\"}]}" },
  { label: "Long run: 12 subscriptions and streams", input: "{\"Subscriptions\":[{\"account_id\":20,\"start_date\":\"2020-04-22\",\"end_date\":\"2020-12-03\"},{\"account_id\":21,\"start_date\":\"2019-10-24\",\"end_date\":\"2020-09-07\"},{\"account_id\":22,\"start_date\":\"2019-02-20\",\"end_date\":\"2019-12-18\"},{\"account_id\":23,\"start_date\":\"2019-10-17\",\"end_date\":\"2020-05-16\"},{\"account_id\":24,\"start_date\":\"2021-04-20\",\"end_date\":\"2022-04-17\"},{\"account_id\":25,\"start_date\":\"2019-07-18\",\"end_date\":\"2020-04-21\"},{\"account_id\":26,\"start_date\":\"2019-07-17\",\"end_date\":\"2020-05-27\"},{\"account_id\":27,\"start_date\":\"2019-10-01\",\"end_date\":\"2020-04-12\"},{\"account_id\":28,\"start_date\":\"2021-05-31\",\"end_date\":\"2021-06-19\"},{\"account_id\":29,\"start_date\":\"2019-06-17\",\"end_date\":\"2019-08-22\"},{\"account_id\":30,\"start_date\":\"2020-04-09\",\"end_date\":\"2020-08-18\"},{\"account_id\":31,\"start_date\":\"2019-02-15\",\"end_date\":\"2019-05-17\"}],\"Streams\":[{\"session_id\":500,\"account_id\":22,\"stream_date\":\"2020-10-07\"},{\"session_id\":501,\"account_id\":20,\"stream_date\":\"2019-11-03\"},{\"session_id\":502,\"account_id\":26,\"stream_date\":\"2020-07-26\"},{\"session_id\":503,\"account_id\":29,\"stream_date\":\"2021-02-04\"},{\"session_id\":504,\"account_id\":22,\"stream_date\":\"2020-04-26\"},{\"session_id\":505,\"account_id\":23,\"stream_date\":\"2019-04-04\"},{\"session_id\":506,\"account_id\":23,\"stream_date\":\"2021-07-24\"},{\"session_id\":507,\"account_id\":20,\"stream_date\":\"2021-02-14\"},{\"session_id\":508,\"account_id\":21,\"stream_date\":\"2020-01-07\"},{\"session_id\":509,\"account_id\":28,\"stream_date\":\"2019-01-04\"},{\"session_id\":510,\"account_id\":23,\"stream_date\":\"2019-12-22\"},{\"session_id\":511,\"account_id\":26,\"stream_date\":\"2019-04-15\"}]}" },
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
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `accounts_count = ${run.result[0].accounts_count}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A subscription counts when its inclusive interval reaches into 2021, meaning it starts by 2021-12-31 and ends on or after 2021-01-01.</p>
    <p>The anti-join keeps an active account only when none of its streams falls in 2021. Several subscriptions for one account are counted once.</p>
  </>} />
}
