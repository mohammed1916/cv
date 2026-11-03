import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Buses and Passengers tables'
const complexity = 'O(b * p) with the simple join used here; the visualizer caps each table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Buses":[{"bus_id":1,"arrival_time":2},{"bus_id":2,"arrival_time":4},{"bus_id":3,"arrival_time":7}],"Passengers":[{"passenger_id":11,"arrival_time":1},{"passenger_id":12,"arrival_time":2},{"passenger_id":13,"arrival_time":3},{"passenger_id":14,"arrival_time":4},{"passenger_id":15,"arrival_time":8}]}',
}]
const reasoning = 'Every passenger is matched to the earliest bus that leaves at or after their arrival. Unlimited capacity means no bus ever turns anyone away, so each passenger is counted once.'

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
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
