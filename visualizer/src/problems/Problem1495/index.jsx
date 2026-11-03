import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Airings', description: 'Start from the TV program rows.' },
    { id: 'content', label: 'Content', description: 'Keep kid-friendly movies only.' },
    { id: 'window', label: 'June', description: 'Keep airings inside June 2020.' },
    { id: 'output', label: 'Join', description: 'Match airings to the kept movies.' },
    { id: 'done', label: 'Result', description: 'Distinct titles in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with content and tv_program lists',
  url: 'https://leetcode.com/problems/friendly-movies-streamed-last-month/',
  complexity: 'O(n log n) time for sorting the airings; n is the number of airing rows.',
  examples: [
    { label: 'Example', input: '{"content":[{"content_id":1,"title":"Dragon Quest","Kids_content":"Y","content_type":"Movies"},{"content_id":2,"title":"Night Shift","Kids_content":"N","content_type":"Movies"},{"content_id":3,"title":"Little Paws","Kids_content":"Y","content_type":"Series"},{"content_id":4,"title":"Ocean Tales","Kids_content":"Y","content_type":"Movies"},{"content_id":5,"title":"Late Show","Kids_content":"Y","content_type":"Movies"}],"tv_program":[{"program_date":"2020-06-02","content_id":1,"channel":"A"},{"program_date":"2020-06-02","content_id":2,"channel":"B"},{"program_date":"2020-06-10","content_id":1,"channel":"B"},{"program_date":"2020-05-31","content_id":4,"channel":"A"},{"program_date":"2020-06-15","content_id":4,"channel":"C"},{"program_date":"2020-06-20","content_id":3,"channel":"A"},{"program_date":"2020-07-01","content_id":5,"channel":"A"},{"program_date":"2020-06-30","content_id":5,"channel":"B"}]}' },
  ],
}

function RowTable({ caption, rows }) {
  const columns = rows.length ? Object.keys(rows[0]) : []
  return (
    <section aria-label={caption}>
      <h3>{caption}</h3>
      {columns.length === 0 ? <p>No rows yet.</p> : (
        <table>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

export default function FriendlyMovies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowTable caption="Working rows" rows={step.rows} />
    <RowTable caption="Result" rows={run.result} />
  </>} renderReasoning={() => <>
    <p>A movie qualifies only when both its content flags match and at least one airing falls between June 1 and June 30, 2020.</p>
    <p>Each kept airing is joined to its title, and repeated titles collapse to one row in the final list.</p>
  </>} />
}
