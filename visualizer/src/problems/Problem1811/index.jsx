import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Contests":[{"contest_id":1,"gold_medal":1,"silver_medal":2,"bronze_medal":3},{"contest_id":2,"gold_medal":1,"silver_medal":4,"bronze_medal":3},{"contest_id":3,"gold_medal":1,"silver_medal":5,"bronze_medal":3},{"contest_id":4,"gold_medal":7,"silver_medal":8,"bronze_medal":9},{"contest_id":6,"gold_medal":2,"silver_medal":10,"bronze_medal":11}],"Users":[{"user_id":1,"mail":"ann@example.com","name":"Ann"},{"user_id":2,"mail":"bo@example.com","name":"Bo"},{"user_id":3,"mail":"cy@example.com","name":"Cy"},{"user_id":4,"mail":"di@example.com","name":"Di"}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Contests and Users tables',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(M log M) for M medal rows, from grouping per user and sorting each user contest list. The visualizer caps each table at 12 rows.',
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

export default function InterviewCandidatesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A user qualifies with three gold medals in total, or with a medal in three consecutive contest IDs. A user meeting both rules is listed once.</p>
    <p>The medal list stacks the three medal columns, so the same test works for every kind of medal.</p>
  </>} />
}
