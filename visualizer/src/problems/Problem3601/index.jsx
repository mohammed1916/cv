import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read the trips and the split date.' },
    { id: 'periods', label: 'Periods', description: 'Total distance and fuel for each period.' },
    { id: 'compare', label: 'Gain', description: 'Late efficiency beats early efficiency.' },
    { id: 'skip', label: 'Skip', description: 'Missing period or no gain.' },
    { id: 'order', label: 'Order', description: 'Sort by gain, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the improved drivers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with drivers, trips and an ISO split date',
  complexity: 'O(T + D log D) for T trips and D drivers.',
  examples: [
    { label: 'Sample', input: SAMPLE_TEXT },
    { label: 'Only early trips', input: '{"split":"2024-02-01","drivers":[{"driver_id":1,"name":"Ana"}],"trips":[{"trip_id":1,"driver_id":1,"trip_date":"2024-01-05","distance_km":50,"fuel_used":5}]}' },
    { label: 'Equal gains sort by name', input: '{"split":"2024-03-01","drivers":[{"driver_id":1,"name":"Ben"},{"driver_id":2,"name":"Ana"}],"trips":[{"trip_id":1,"driver_id":1,"trip_date":"2024-02-01","distance_km":100,"fuel_used":10},{"trip_id":2,"driver_id":1,"trip_date":"2024-03-01","distance_km":200,"fuel_used":10},{"trip_id":3,"driver_id":2,"trip_date":"2024-02-01","distance_km":100,"fuel_used":10},{"trip_id":4,"driver_id":2,"trip_date":"2024-03-01","distance_km":200,"fuel_used":10}]}' },
    { label: 'Trip on the split date', input: '{"split":"2024-06-15","drivers":[{"driver_id":3,"name":"Cleo"}],"trips":[{"trip_id":5,"driver_id":3,"trip_date":"2024-06-14","distance_km":60,"fuel_used":6},{"trip_id":6,"driver_id":3,"trip_date":"2024-06-15","distance_km":90,"fuel_used":6}]}' },
    { label: 'Long run: 8 drivers, 24 trips', input: '{"split":"2024-07-01","drivers":[{"driver_id":1,"name":"Ana"},{"driver_id":2,"name":"Ben"},{"driver_id":3,"name":"Cleo"},{"driver_id":4,"name":"Dee"},{"driver_id":5,"name":"Eli"},{"driver_id":6,"name":"Fay"},{"driver_id":7,"name":"Gil"},{"driver_id":8,"name":"Hana"}],"trips":[{"trip_id":1,"driver_id":1,"trip_date":"2024-12-16","distance_km":42,"fuel_used":11},{"trip_id":2,"driver_id":2,"trip_date":"2024-10-09","distance_km":163,"fuel_used":13},{"trip_id":3,"driver_id":8,"trip_date":"2024-12-17","distance_km":100,"fuel_used":14},{"trip_id":4,"driver_id":7,"trip_date":"2024-03-01","distance_km":47,"fuel_used":12},{"trip_id":5,"driver_id":4,"trip_date":"2024-02-27","distance_km":178,"fuel_used":13},{"trip_id":6,"driver_id":2,"trip_date":"2024-09-13","distance_km":88,"fuel_used":8},{"trip_id":7,"driver_id":5,"trip_date":"2024-10-31","distance_km":150,"fuel_used":21},{"trip_id":8,"driver_id":2,"trip_date":"2024-09-17","distance_km":94,"fuel_used":13},{"trip_id":9,"driver_id":3,"trip_date":"2024-04-20","distance_km":198,"fuel_used":14},{"trip_id":10,"driver_id":6,"trip_date":"2024-03-21","distance_km":121,"fuel_used":6},{"trip_id":11,"driver_id":7,"trip_date":"2024-03-04","distance_km":91,"fuel_used":9},{"trip_id":12,"driver_id":8,"trip_date":"2024-03-27","distance_km":169,"fuel_used":21},{"trip_id":13,"driver_id":7,"trip_date":"2024-11-21","distance_km":134,"fuel_used":20},{"trip_id":14,"driver_id":7,"trip_date":"2024-03-15","distance_km":78,"fuel_used":5},{"trip_id":15,"driver_id":4,"trip_date":"2024-05-10","distance_km":181,"fuel_used":20},{"trip_id":16,"driver_id":2,"trip_date":"2024-04-28","distance_km":96,"fuel_used":6},{"trip_id":17,"driver_id":6,"trip_date":"2024-08-22","distance_km":90,"fuel_used":2},{"trip_id":18,"driver_id":3,"trip_date":"2024-10-28","distance_km":87,"fuel_used":8},{"trip_id":19,"driver_id":5,"trip_date":"2024-04-17","distance_km":123,"fuel_used":16},{"trip_id":20,"driver_id":1,"trip_date":"2024-03-11","distance_km":27,"fuel_used":18},{"trip_id":21,"driver_id":1,"trip_date":"2024-09-30","distance_km":113,"fuel_used":3},{"trip_id":22,"driver_id":3,"trip_date":"2024-09-22","distance_km":171,"fuel_used":18},{"trip_id":23,"driver_id":2,"trip_date":"2024-08-16","distance_km":61,"fuel_used":3},{"trip_id":24,"driver_id":3,"trip_date":"2024-12-10","distance_km":97,"fuel_used":15}]}' },
  ],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindDriversWithImprovedFuelEfficiency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Efficiency for a period is total kilometres divided by total litres, so long trips weigh more than short ones.</p>
    <p>A driver is listed only when both periods have trips and the late efficiency is higher.</p>
  </>} />
}
