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
  examples: [
    { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
    { label: 'Single day event', input: '{"HallEvents":[{"hall_id":1,"start_day":4,"end_day":4}]}' },
    { label: 'Same start day', input: '{"HallEvents":[{"hall_id":2,"start_day":5,"end_day":5},{"hall_id":2,"start_day":5,"end_day":9}]}' },
    { label: 'Largest table, far days', input: '{"HallEvents":[{"hall_id":1,"start_day":1,"end_day":1},{"hall_id":2,"start_day":71,"end_day":101},{"hall_id":1,"start_day":141,"end_day":201},{"hall_id":2,"start_day":211,"end_day":211},{"hall_id":1,"start_day":281,"end_day":311},{"hall_id":2,"start_day":351,"end_day":411},{"hall_id":1,"start_day":421,"end_day":421},{"hall_id":2,"start_day":491,"end_day":521},{"hall_id":1,"start_day":561,"end_day":621},{"hall_id":2,"start_day":631,"end_day":631},{"hall_id":1,"start_day":701,"end_day":731},{"hall_id":2,"start_day":771,"end_day":831},{"hall_id":1,"start_day":841,"end_day":841},{"hall_id":2,"start_day":911,"end_day":941}]}' },
    { label: 'Long run: 14 events', input: '{"HallEvents":[{"hall_id":1,"start_day":35,"end_day":37},{"hall_id":1,"start_day":14,"end_day":14},{"hall_id":1,"start_day":18,"end_day":28},{"hall_id":2,"start_day":26,"end_day":29},{"hall_id":1,"start_day":18,"end_day":25},{"hall_id":3,"start_day":42,"end_day":46},{"hall_id":3,"start_day":22,"end_day":31},{"hall_id":3,"start_day":39,"end_day":47},{"hall_id":2,"start_day":36,"end_day":36},{"hall_id":3,"start_day":40,"end_day":48},{"hall_id":1,"start_day":18,"end_day":24},{"hall_id":1,"start_day":1,"end_day":11},{"hall_id":1,"start_day":43,"end_day":50},{"hall_id":1,"start_day":7,"end_day":8}]}' },
  ],
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
