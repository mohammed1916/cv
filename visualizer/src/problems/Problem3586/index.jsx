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
    { id: 'load', label: 'Load', description: 'Read the dated test results.' },
    { id: 'positive', label: 'First positive', description: 'Keep the earliest positive test per patient.' },
    { id: 'check', label: 'Look for negative', description: 'Find a negative test after the positive one.' },
    { id: 'pair', label: 'Pair', description: 'Record the gap in days for this patient.' },
    { id: 'order', label: 'Order', description: 'Sort by gap, then by name.' },
    { id: 'done', label: 'Result', description: 'Report the recovered patients.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with patients and covid_tests lists',
  complexity: 'O(T log T) for T tests: sort by date, then one pass per patient.',
  examples: [
    { label: 'Sample', input: SAMPLE_TEXT },
    { label: 'Negative only', input: '{"patients":[{"patient_id":1,"patient_name":"Ana"}],"covid_tests":[{"test_id":1,"patient_id":1,"test_date":"2024-01-01","result":"Negative"}]}' },
    { label: 'Equal gaps sort by name', input: '{"patients":[{"patient_id":1,"patient_name":"Ben"},{"patient_id":2,"patient_name":"Ana"}],"covid_tests":[{"test_id":1,"patient_id":1,"test_date":"2024-02-01","result":"Positive"},{"test_id":2,"patient_id":1,"test_date":"2024-02-11","result":"Negative"},{"test_id":3,"patient_id":2,"test_date":"2024-02-01","result":"Positive"},{"test_id":4,"patient_id":2,"test_date":"2024-02-11","result":"Negative"}]}' },
    { label: 'Year boundary', input: '{"patients":[{"patient_id":3,"patient_name":"Cara"}],"covid_tests":[{"test_id":5,"patient_id":3,"test_date":"2024-12-31","result":"Positive"},{"test_id":6,"patient_id":3,"test_date":"2025-01-01","result":"Negative"}]}' },
    { label: 'Long run: 8 patients, 24 tests', input: '{"patients":[{"patient_id":1,"patient_name":"Ana"},{"patient_id":2,"patient_name":"Ben"},{"patient_id":3,"patient_name":"Cara"},{"patient_id":4,"patient_name":"Dev"},{"patient_id":5,"patient_name":"Eli"},{"patient_id":6,"patient_name":"Fay"},{"patient_id":7,"patient_name":"Gil"},{"patient_id":8,"patient_name":"Hana"}],"covid_tests":[{"test_id":1,"patient_id":6,"test_date":"2024-05-15","result":"Negative"},{"test_id":2,"patient_id":1,"test_date":"2024-12-10","result":"Positive"},{"test_id":3,"patient_id":5,"test_date":"2024-10-25","result":"Negative"},{"test_id":4,"patient_id":1,"test_date":"2024-05-29","result":"Negative"},{"test_id":5,"patient_id":4,"test_date":"2024-06-26","result":"Positive"},{"test_id":6,"patient_id":3,"test_date":"2024-10-10","result":"Positive"},{"test_id":7,"patient_id":8,"test_date":"2024-07-11","result":"Positive"},{"test_id":8,"patient_id":5,"test_date":"2024-05-19","result":"Negative"},{"test_id":9,"patient_id":5,"test_date":"2024-08-25","result":"Positive"},{"test_id":10,"patient_id":7,"test_date":"2024-07-05","result":"Negative"},{"test_id":11,"patient_id":4,"test_date":"2024-08-03","result":"Negative"},{"test_id":12,"patient_id":8,"test_date":"2024-09-10","result":"Positive"},{"test_id":13,"patient_id":7,"test_date":"2024-10-28","result":"Positive"},{"test_id":14,"patient_id":8,"test_date":"2024-12-25","result":"Positive"},{"test_id":15,"patient_id":7,"test_date":"2024-03-29","result":"Negative"},{"test_id":16,"patient_id":6,"test_date":"2024-10-24","result":"Negative"},{"test_id":17,"patient_id":6,"test_date":"2024-02-28","result":"Positive"},{"test_id":18,"patient_id":2,"test_date":"2024-02-03","result":"Negative"},{"test_id":19,"patient_id":4,"test_date":"2024-08-05","result":"Positive"},{"test_id":20,"patient_id":3,"test_date":"2024-11-08","result":"Negative"},{"test_id":21,"patient_id":4,"test_date":"2024-07-03","result":"Positive"},{"test_id":22,"patient_id":2,"test_date":"2024-04-07","result":"Positive"},{"test_id":23,"patient_id":7,"test_date":"2024-03-30","result":"Positive"},{"test_id":24,"patient_id":4,"test_date":"2024-11-17","result":"Positive"}]}' },
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

export default function FindCovidRecoveryPatients() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each patient contributes one pair: the earliest positive test and the earliest negative test that follows it.</p>
    <p>Sorting the tests by date first means the first positive is simply the first one we meet.</p>
  </>} />
}
