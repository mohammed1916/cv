import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const INPUT_LABEL = "Object with an activity list"
const EXAMPLE = "{\"activity\":[{\"machine_id\":0,\"process_id\":0,\"activity_type\":\"start\",\"timestamp\":2},{\"machine_id\":0,\"process_id\":0,\"activity_type\":\"end\",\"timestamp\":9},{\"machine_id\":0,\"process_id\":1,\"activity_type\":\"start\",\"timestamp\":4},{\"machine_id\":0,\"process_id\":1,\"activity_type\":\"end\",\"timestamp\":12},{\"machine_id\":1,\"process_id\":0,\"activity_type\":\"start\",\"timestamp\":1},{\"machine_id\":1,\"process_id\":0,\"activity_type\":\"end\",\"timestamp\":4},{\"machine_id\":1,\"process_id\":1,\"activity_type\":\"start\",\"timestamp\":2},{\"machine_id\":1,\"process_id\":1,\"activity_type\":\"end\",\"timestamp\":4},{\"machine_id\":1,\"process_id\":2,\"activity_type\":\"start\",\"timestamp\":5},{\"machine_id\":1,\"process_id\":2,\"activity_type\":\"end\",\"timestamp\":11}]}"
const COMPLEXITY = 'The lesson runs a few passes over the sample tables; the parser caps each table at a small size.'
const REASONING = ["The pairing uses both the machine and the process, since one machine runs several processes.","Each process is measured once, so the average is over processes, not over raw log lines."]

const definition = {
  number: '1661',
  title: "Average Time of Process per Machine",
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: INPUT_LABEL,
  complexity: COMPLEXITY,
  examples: [{ label: 'Sample', input: EXAMPLE }, { label: 'One process', input: '{"activity":[{"machine_id":0,"process_id":0,"activity_type":"start","timestamp":1},{"machine_id":0,"process_id":0,"activity_type":"end","timestamp":3}]}' }, { label: 'Equal timestamps', input: '{"activity":[{"machine_id":0,"process_id":0,"activity_type":"start","timestamp":5},{"machine_id":1,"process_id":1,"activity_type":"start","timestamp":5},{"machine_id":0,"process_id":0,"activity_type":"end","timestamp":9},{"machine_id":1,"process_id":1,"activity_type":"end","timestamp":9}]}' }, { label: 'Large timestamps', input: '{"activity":[{"machine_id":2,"process_id":7,"activity_type":"start","timestamp":1000000000},{"machine_id":2,"process_id":7,"activity_type":"end","timestamp":1000000007}]}' }, { label: 'Long run: 20 rows', input: '{"activity":[{"machine_id":0,"process_id":0,"activity_type":"start","timestamp":27},{"machine_id":0,"process_id":0,"activity_type":"end","timestamp":49},{"machine_id":2,"process_id":1,"activity_type":"start","timestamp":42},{"machine_id":2,"process_id":1,"activity_type":"end","timestamp":55},{"machine_id":0,"process_id":2,"activity_type":"start","timestamp":23},{"machine_id":0,"process_id":2,"activity_type":"end","timestamp":24},{"machine_id":4,"process_id":3,"activity_type":"start","timestamp":38},{"machine_id":4,"process_id":3,"activity_type":"end","timestamp":65},{"machine_id":1,"process_id":4,"activity_type":"start","timestamp":44},{"machine_id":1,"process_id":4,"activity_type":"end","timestamp":53},{"machine_id":4,"process_id":5,"activity_type":"start","timestamp":34},{"machine_id":4,"process_id":5,"activity_type":"end","timestamp":47},{"machine_id":1,"process_id":6,"activity_type":"start","timestamp":42},{"machine_id":1,"process_id":6,"activity_type":"end","timestamp":49},{"machine_id":2,"process_id":7,"activity_type":"start","timestamp":35},{"machine_id":2,"process_id":7,"activity_type":"end","timestamp":62},{"machine_id":3,"process_id":8,"activity_type":"start","timestamp":38},{"machine_id":3,"process_id":8,"activity_type":"end","timestamp":52},{"machine_id":0,"process_id":9,"activity_type":"start","timestamp":15},{"machine_id":0,"process_id":9,"activity_type":"end","timestamp":20}]}' }],
}

const formatValue = value => value === undefined || value === null ? '' : typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)

function RowTable({ label, rows }) {
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))]
  return <section aria-label={label}>
    <h4>{label}</h4>
    {rows.length === 0 ? <p>No rows yet.</p> : <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}</tbody>
    </table>}
  </section>
}

// Each machine is a lane; each matched process is a bar from its start time to its end time.
function ProcessTimeline({ rows }) {
  const spans = rows.filter(row => 'start_at' in row && 'end_at' in row)
  if (spans.length === 0) return null
  const maxT = Math.max(...spans.map(row => row.end_at), 1)
  const machines = [...new Set(spans.map(row => row.machine_id))].sort((a, b) => a - b)
  return <section aria-label="Processes on a time line">
    <h4>Each process as a bar on its machine's lane</h4>
    {machines.map(machine => <div key={machine} style={{ display: 'grid', gridTemplateColumns: '5rem 1fr', gap: 8, alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>machine {machine}</span>
      <div style={{ position: 'relative', height: 22, background: 'var(--surface2)', borderRadius: 4 }}>
        {spans.filter(row => row.machine_id === machine).map(row => <div key={row.process_id} title={`process ${row.process_id}: ${row.end_at - row.start_at}`} style={{
          position: 'absolute', top: 3, bottom: 3, borderRadius: 3, background: 'var(--primary)', opacity: 0.85,
          left: `${(row.start_at / maxT) * 100}%`, width: `${((row.end_at - row.start_at) / maxT) * 100}%`,
        }} />)}
      </div>
    </div>)}
    <p style={{ color: 'var(--text-muted)' }}>Bar length is end minus start. The time axis runs from 0 to {maxT}.</p>
  </section>
}

export default function Problem1661() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <ProcessTimeline rows={step.rows} />
      <RowTable label="Working rows" rows={step.rows} />
      <RowTable label="Output" rows={step.output} />
    </>}
    renderReasoning={() => <>{REASONING.map(text => <p key={text}>{text}</p>)}</>} />
}
