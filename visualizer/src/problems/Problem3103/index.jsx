import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Tweets table (tweet_id, tweet_date as YYYY-MM-DD, tweet text)'
const complexity = 'O(t log t) for t distinct hashtag rows in the date range. The visualization caps Tweets at 12 rows.'
const examples = [
  {
    label: 'Sample',
    input: '{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-10","tweet":"#ai #ml #ai"},{"tweet_id":2,"tweet_date":"2024-02-11","tweet":"#ml"},{"tweet_id":3,"tweet_date":"2024-02-12","tweet":"#data #ai"},{"tweet_id":4,"tweet_date":"2024-02-09","tweet":"#ai"},{"tweet_id":5,"tweet_date":"2024-03-02","tweet":"#data #data"},{"tweet_id":6,"tweet_date":"2024-03-03","tweet":"#ml"},{"tweet_id":7,"tweet_date":"2024-02-15","tweet":"hello"},{"tweet_id":8,"tweet_date":"2024-02-20","tweet":"#go #ml #data"}]}',
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

export default function TrendingHashtagsIiSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A tweet that repeats a hashtag still counts that tag only once, so each tweet is first reduced to its distinct tags.</p>
    <p>The date filter then runs on the tag rows, and the counts are ranked by use and name before the top three are kept.</p>
  </>} />
}
