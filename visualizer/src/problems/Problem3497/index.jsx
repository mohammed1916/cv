import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const WORK_COLUMNS = ['user_id', 'activity_date', 'activity_type', 'activity_duration']
const RESULT_COLUMNS = ['user_id', 'trial_avg', 'paid_avg']

function RowTable({ label, rows, columns }) {
  return (
    <section>
      <h4>{label}</h4>
      {rows.length === 0 ? <p>No rows yet.</p> : (
        <table aria-label={label}>
          <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => (
            <tr key={index}>{columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}</tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}

const definition = {
  number: '3497',
  phases: [
    { id: 'load', label: 'Load', description: 'Read the activity rows.' },
    { id: 'trial', label: 'First trial', description: 'Find each user’s first trial date.' },
    { id: 'qualify', label: 'Qualify', description: 'Keep users with a paid row after the first trial.' },
    { id: 'average', label: 'Average', description: 'Average trial and paid durations per user.' },
    { id: 'output', label: 'Output', description: 'Return the rows ordered by user.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with user_activity rows (user_id, activity_date, activity_type trial or paid, activity_duration)',
  url: 'https://leetcode.com/problems/analyze-subscription-conversion/description/',
  complexity: 'O(r + u * r) time for r rows and u users in this small teaching trace. A production query can use one grouped pass.',
  examples: [
    {
      label: 'Sample',
      input: '{"user_activity":[{"user_id":1,"activity_date":"2024-01-01","activity_type":"trial","activity_duration":10},{"user_id":1,"activity_date":"2024-01-03","activity_type":"trial","activity_duration":20},{"user_id":1,"activity_date":"2024-01-10","activity_type":"paid","activity_duration":30},{"user_id":2,"activity_date":"2024-02-01","activity_type":"trial","activity_duration":5},{"user_id":3,"activity_date":"2024-03-01","activity_type":"paid","activity_duration":40},{"user_id":3,"activity_date":"2024-03-05","activity_type":"trial","activity_duration":8},{"user_id":3,"activity_date":"2024-03-09","activity_type":"paid","activity_duration":12}]}',
    },
    {
      label: 'No conversion',
      input: '{"user_activity":[{"user_id":5,"activity_date":"2024-06-01","activity_type":"trial","activity_duration":6},{"user_id":5,"activity_date":"2024-06-04","activity_type":"trial","activity_duration":4}]}',
    },
  ],
}

export default function AnalyzeSubscriptionConversion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable label="Working rows" rows={step.rows} columns={WORK_COLUMNS} />
    <RowTable label="Result so far" rows={step.result} columns={RESULT_COLUMNS} />
  </>} renderReasoning={() => <>
    <p>A user converts only when a paid row falls after that user's first trial row. Users who never trial, or who pay only before trialling, drop out here.</p>
    <p>Averages are taken per user and per activity type, then rounded to two decimals.</p>
  </>} />
}
