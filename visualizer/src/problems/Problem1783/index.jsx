import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Players and Championships tables'
const complexity = 'Reads each championship row once and adds four wins per row, so the work is linear in the number of rows. The visualizer caps each table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Players":[{"player_id":1,"player_name":"Alice"},{"player_id":2,"player_name":"Bob"},{"player_id":3,"player_name":"Cara"},{"player_id":4,"player_name":"Dan"},{"player_id":5,"player_name":"Eve"}],"Championships":[{"year":2019,"Wimbledon":1,"Fr_open":2,"US_open":3,"Au_open":4},{"year":2020,"Wimbledon":1,"Fr_open":4,"US_open":4,"Au_open":2},{"year":2021,"Wimbledon":2,"Fr_open":3,"US_open":1,"Au_open":1}]}',
}]

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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>The four tournament columns are stacked into one list of winner ids, so every win counts once no matter which tournament it came from. Players who never appear in that list drop out of the join.</p>} />
}
