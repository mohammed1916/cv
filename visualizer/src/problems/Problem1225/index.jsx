import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

function RowTable({ label, columns = [], rows = [] }) {
  return <div>
    <p><strong>{label}</strong></p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? '')}</td>)}
      </tr>) : <tr><td style={cell} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>}</tbody>
    </table>
  </div>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with failed (fail_date) and succeeded (success_date) date lists',
  url: 'https://leetcode.com/problems/report-contiguous-dates/',
  complexity: 'O(n log n) to order the dates, then one pass over them. The visualization caps each list at 12 dates.',
  examples: [
    { label: 'Mixed runs', input: '{"failed":[{"fail_date":"2018-12-31"},{"fail_date":"2019-01-01"},{"fail_date":"2019-01-02"},{"fail_date":"2019-01-05"}],"succeeded":[{"success_date":"2019-01-03"},{"success_date":"2019-01-04"},{"success_date":"2019-01-06"},{"success_date":"2019-02-01"}]}' },
    { label: 'One gap', input: '{"failed":[{"fail_date":"2019-03-10"}],"succeeded":[{"success_date":"2019-03-12"}]}' },
    { label: 'Only successes', input: '{\"failed\":[],\"succeeded\":[{\"success_date\":\"2019-02-01\"}]}' },
    { label: 'Adjacent days swap outcome', input: '{\"failed\":[{\"fail_date\":\"2019-01-01\"}],\"succeeded\":[{\"success_date\":\"2019-01-02\"}]}' },
    { label: 'Long run: twenty-four shuffled days', input: '{\"failed\":[{\"fail_date\":\"2019-01-02\"},{\"fail_date\":\"2019-01-20\"},{\"fail_date\":\"2019-01-12\"},{\"fail_date\":\"2019-01-06\"},{\"fail_date\":\"2019-01-22\"},{\"fail_date\":\"2019-01-21\"},{\"fail_date\":\"2019-01-24\"},{\"fail_date\":\"2019-01-03\"},{\"fail_date\":\"2019-01-05\"},{\"fail_date\":\"2019-01-08\"},{\"fail_date\":\"2019-01-10\"},{\"fail_date\":\"2019-01-04\"}],\"succeeded\":[{\"success_date\":\"2019-01-14\"},{\"success_date\":\"2019-01-23\"},{\"success_date\":\"2019-01-15\"},{\"success_date\":\"2019-01-19\"},{\"success_date\":\"2019-01-16\"},{\"success_date\":\"2019-01-07\"},{\"success_date\":\"2019-01-11\"},{\"success_date\":\"2019-01-17\"},{\"success_date\":\"2019-01-01\"},{\"success_date\":\"2019-01-13\"},{\"success_date\":\"2019-01-09\"},{\"success_date\":\"2019-01-18\"}]}' },
  ],
}

function StageStrip({ phases, current }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map(stage => <li key={stage.id} data-stage={stage.id} aria-current={stage.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', border: stage.id === current ? '2px solid var(--text)' : '1px solid var(--border)',
      background: stage.id === current ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)', color: 'var(--text)',
    }}>{stage.label}</li>)}
  </ol>
}

export default function ReportContiguousDates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} current={step.phase} />
    <RowTable label={`Working rows (${step.phase})`} columns={step.columns} rows={step.rows} />
    {step.phase === 'done' && <RowTable label="Result" columns={run.columns} rows={run.result} />}
  </>} renderReasoning={() => <>
    <p>Each run is an interval: l is its first day and r its last day.</p>
    <p>Only dates in 2019 count. Adjacent days in the same state form one period, so a run keeps extending while the next day is the day after the current end and has the same state.</p>
    <p>A day with the other outcome, or a missing day, closes the current period and opens a new one.</p>
  </>} />
}
