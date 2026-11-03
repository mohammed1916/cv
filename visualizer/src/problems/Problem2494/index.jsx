import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = {
  "HallEvents": [
    {
      "hall_id": 1,
      "start_day": 1,
      "end_day": 4
    },
    {
      "hall_id": 1,
      "start_day": 2,
      "end_day": 3
    },
    {
      "hall_id": 1,
      "start_day": 6,
      "end_day": 8
    },
    {
      "hall_id": 1,
      "start_day": 8,
      "end_day": 10
    },
    {
      "hall_id": 2,
      "start_day": 1,
      "end_day": 2
    },
    {
      "hall_id": 2,
      "start_day": 3,
      "end_day": 5
    },
    {
      "hall_id": 3,
      "start_day": 7,
      "end_day": 7
    }
  ]
}

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel: 'JSON object with a HallEvents table',
  complexity: 'Sorting dominates: O(n log n) for n events, plus one pass to flag groups and one pass to collapse them.',
  examples: [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }],
}

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p>{empty}</p>
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function Problem2494() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="No events to merge." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Events are inclusive day ranges. Two ranges merge only when they share a day, so day 2 and day 3 touch and day 3 and day 5 start after the furthest end. In this model, adjacent days such as 2 and 3 stay separate.</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization.</p>
    </>} />
}
