import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Tweets table (tweet_id, tweet_date as YYYY-MM-DD, tweet text)'
const complexity = 'O(n log n) for the final ranking over the tagged tweets. The visualization caps Tweets at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-03","tweet":"Loving #python today"},{"tweet_id":2,"tweet_date":"2024-02-05","tweet":"#sql is fun"},{"tweet_id":3,"tweet_date":"2024-02-09","tweet":"Trying #python and #sql"},{"tweet_id":4,"tweet_date":"2024-02-14","tweet":"#java rocks"},{"tweet_id":5,"tweet_date":"2024-02-20","tweet":"#sql again"},{"tweet_id":6,"tweet_date":"2024-03-01","tweet":"#python in March"},{"tweet_id":7,"tweet_date":"2024-02-22","tweet":"no tags here"},{"tweet_id":8,"tweet_date":"2024-02-27","tweet":"#sql #java"},{"tweet_id":9,"tweet_date":"2024-02-28","tweet":"#go"}]}',
  },
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

export default function TrendingHashtagsSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each tweet contributes its first hashtag, if it has one. The month filter then keeps February 2024 only.</p>
    <p>Counts are sorted by number of uses (highest first) and then by name, and the query keeps three rows.</p>
  </>} />
}
