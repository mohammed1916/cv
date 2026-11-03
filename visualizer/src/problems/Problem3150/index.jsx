import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Tweets table (tweet_id, content)'
const complexity = 'O(n * L) for n tweets of length L, one count per mark. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Tweets":[{"tweet_id":1,"content":"Let us meet at noon"},{"tweet_id":2,"content":"#a #b #c #d are too many tags"},{"tweet_id":3,"content":"@ana hi @ben and @cy and @dee"},{"tweet_id":4,"content":"Short note #one"}]}' },
  { label: 'Long text', input: '{"Tweets":[{"tweet_id":5,"content":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},{"tweet_id":6,"content":"Fine"}]}' },
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

export default function InvalidTweetsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each tweet is checked against three rules in turn: its character count, its hashtag marks and its mention marks. One rule failing is enough to flag the tweet.</p>
    <p>The SQL counts marks by comparing the text length with the length after removing each mark, which is the same count the Python version takes with str.count.</p>
  </>} />
}
