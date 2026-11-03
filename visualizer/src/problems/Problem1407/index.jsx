import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Users', description: 'Load the users table.' },
    { id: 'join', label: 'Join', description: 'Attach rides to users with a left join.' },
    { id: 'group', label: 'Sum', description: 'Total the distance for each user.' },
    { id: 'order', label: 'Sort', description: 'Order by total distance, then name.' },
    { id: 'output', label: 'Result', description: 'Report name and total distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with users ({id, name}) and rides ({id, user_id, distance})',
  complexity: 'Knowledge-derived teaching model. The trace is for learning the query shape, not an optimized engine.',
  examples: [
    { label: 'Sample', input: '{"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Bo"},{"id":3,"name":"Cy"}],"rides":[{"id":1,"user_id":1,"distance":20},{"id":2,"user_id":2,"distance":30},{"id":3,"user_id":1,"distance":40}]}' },
    { label: 'Ties', input: '{"users":[{"id":1,"name":"Zed"},{"id":2,"name":"Amy"},{"id":3,"name":"Kit"}],"rides":[{"id":1,"user_id":1,"distance":5}]}' },
  ],
}

function RowTable({ columns, rows }) {
  return <table aria-label="Current rows">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>
      {columns.map(column => <td key={column}>{row[column] === null ? 'null' : String(row[column])}</td>)}
    </tr>)}</tbody>
  </table>
}

export default function TravellerTotals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable columns={step.columns} rows={step.rows} />
    <output aria-label="Stage">{`${step.phase}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A left join keeps every user, so a user without rides still appears. Summing a missing distance would give null, so coalesce turns it into zero.</p>
    <p>Sorting uses total distance descending, then name ascending, which breaks ties in a fixed way.</p>
  </>} />
}
