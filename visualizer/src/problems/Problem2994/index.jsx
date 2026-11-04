import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import NovemberCalendar from './NovemberCalendar'

const inputLabel = 'Object with a Purchases table'
const complexity = 'O(p + f) for p purchase rows and f Fridays. The visualizer caps Purchases at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":50},{"user_id":2,"purchase_date":"2023-11-03","amount_spend":30},{"user_id":3,"purchase_date":"2023-11-10","amount_spend":20},{"user_id":4,"purchase_date":"2023-11-04","amount_spend":99},{"user_id":5,"purchase_date":"2023-10-27","amount_spend":70},{"user_id":6,"purchase_date":"2023-11-24","amount_spend":15},{"user_id":7,"purchase_date":"2023-11-24","amount_spend":5}]}',
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
    <NovemberCalendar rows={step.rows} stage={step.phase === 'load' ? '' : 'friday'} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>The calendar is built first, so every Friday appears even without purchases. Each Friday then receives its total, with zero as the default, and the rows are returned in date order.</p>} />
}
